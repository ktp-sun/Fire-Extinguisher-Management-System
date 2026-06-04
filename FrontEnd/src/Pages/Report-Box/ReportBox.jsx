import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../Auth/AuthProvider";
import SweetAlert from "sweetalert2";
import "boxicons";
import "./ReportBox.css";

const ReportBox = () => {
  const { user } = useAuth();
  const [reportList, setReportList] = useState([]); 
  const [checkedItems, setCheckedItems] = useState({});
  const [searchReportTerm, setSearchReportTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    Company: [],
    Branch: [],
  });

  const filterBoxRef = useRef();

  useEffect(() => {
    const fetchReports = () => {
      fetch(`http://${window.location.hostname}:3000/report/getReportByStatus/pending`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setReportList(data);
          } else {
            console.error("Fetched data is not an array:", data);
          }
        })
        .catch((error) => console.error("Error fetching reports:", error));
    };

    fetchReports();


    const interval = setInterval(fetchReports, 1000);

    return () => clearInterval(interval);
  }, []);

  const showImagePreview = (reportId) => {
    SweetAlert.fire({

      imageUrl: `http://${window.location.hostname}:3000/getImage/${reportId}`,
      imageWidth: 250,
      imageHeight: 250,
      imageAlt: "Image Preview",
      showConfirmButton: true,
    });
  };

  const updateReportStatus = async (status) => {
    const selectedIds = Object.keys(checkedItems).filter((id) => checkedItems[id]);
    try {
      const response = await fetch(`http://${window.location.hostname}:3000/report/updateReport/${status}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ids: selectedIds, user: user }),
      });

      const data = await response.json();

      if (response.ok) {
        SweetAlert.fire("Success", data.message, "success");
        const newReports = await fetch(`http://${window.location.hostname}:3000/report/getReportByStatus/pending`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }).then((res) => res.json());
        setReportList(newReports);
        setCheckedItems({});
      } else {
        SweetAlert.fire("Error", data.message, "error");
      }
    } catch (error) {
      console.error("Error updating report:", error);
      SweetAlert.fire("Error", "Something went wrong!", "error");
    }
  };

  const handleItemCheck = (reportId) => {
    const selectedReport = reportList.find((r) => r.report_id === reportId);
    if (!selectedReport) return;

    const serial = selectedReport.item_id;

    setCheckedItems((prev) => {
      const newChecked = { ...prev };

      for (let id in newChecked) {
        const r = reportList.find((r) => r.report_id === id);
        if (r && r.item_id === serial) {
          delete newChecked[id];
        }
      }

      if (!prev[reportId]) {
        newChecked[reportId] = true;
      }

      return newChecked;
    });
  };

  const toggleAllItemCheckBox = (e) => {
    const checked = e.target.checked;
    const updatedCheckedItems = {};
    filteredReports.forEach((report) => {
      updatedCheckedItems[report.report_id] = checked;
    });
    setCheckedItems(updatedCheckedItems);
  };

  const handleConfirmAccept = () => {
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    if (checkedCount === 0) {
      SweetAlert.fire("Warning", "Please select at least one report", "warning");
      return;
    }
    SweetAlert.fire({
      title: "Are you sure?",
      text: `You need to accept ${checkedCount} report(s)?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#B3B4AD",
      confirmButtonText: "Accept",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        updateReportStatus("accepted");
      }
    });
  };

  const handleConfirmReject = () => {
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    if (checkedCount === 0) {
      SweetAlert.fire("Warning", "Please select at least one report", "warning");
      return;
    }
    SweetAlert.fire({
      title: "Are you sure?",
      text: `You need to reject ${checkedCount} report(s)?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#B3B4AD",
      confirmButtonText: "Reject",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        updateReportStatus("rejected");
      }
    });
  };

  const toggleFilterBox = () => {
    filterBoxRef.current.classList.toggle("hidden");
  };

  const filterList = {
    Company: [...new Set(reportList.map((r) => r.client_id))],
  };

  const handleCheckbox = (type, value) => {
    setSelectedFilters((prev) => {
      const newValues = prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value];
      return { ...prev, [type]: newValues };
    });
  };

  const filteredReports = reportList
    .filter((report) =>
      report.report_id.toLowerCase().includes(searchReportTerm.toLowerCase())
    )
    .filter((report) =>
      Object.entries(selectedFilters).every(([key, selected]) => {
        if (selected.length === 0) return true;
        if (key === "Company") return selected.includes(report.client_id);
        if (key === "Branch") return selected.includes(report.client_branch_id);
        return true;
      })
    );

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="report-box-Admin grid gap-2">
      <div className="report-box-list flex flex-col gap-2 flex-1 bg-white p-1 drop-shadow-md rounded-lg">
        {/* HEADER */}
        <div className="report-box-list-bar bg-primary p-2 rounded-[8px] drop-shadow flex items-center justify-between sticky top-0 z-10 text-nowrap">
          <div className="report-box-list-header flex gap-1 justify-center items-center">
            <box-icon name="comment-error" type="regular" size="md" color="white"></box-icon>
            <h2 className="text-white">Report List</h2>
          </div>
          <div className="report-box-list-tool flex gap-2 items-center">
            <div className="report-box-search flex flex-col justify-center items-center gap-2">
              <div className="report-box-search-box flex gap-2">
                <button onClick={toggleFilterBox}>
                  <box-icon name="filter" type="regular" size="sm" color="#FD6E28"></box-icon>
                </button>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchReportTerm}
                  onChange={(e) => setSearchReportTerm(e.target.value)}
                />
                <button className="flex justify-center items-center w-fit h-fit">
                  <box-icon name="search" type="regular" size="sm" color="#FF6700"></box-icon>
                </button>
              </div>

              {/* FILTER BOX */}
              <div className="filter-box hidden bg-secondary p-2 rounded-md drop-shadow text-black max-w-xs" ref={filterBoxRef}>
                {Object.keys(filterList).map((key) => (
                  <div className="filter-item flex flex-col gap-1 mb-2" key={key}>
                    <h4 className="text-white text-sm w-full text-center bg-primary rounded px-2 py-1">{key}</h4>
                    {filterList[key].map((item) => (
                      <div className="filter-list flex items-center gap-1 px-2" key={item}>
                        <input
                          type="checkbox"
                          id={`${key}-${item}`}
                          checked={selectedFilters[key]?.includes(item)}
                          onChange={() => handleCheckbox(key, item)}
                        />
                        <label htmlFor={`${key}-${item}`} className="text-sm">{item}</label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
                {/* LIST HEADER */}
                <div className="report-box-list-body min-fit w-full gap-1 grid">
          <div className="report-box-list-header grid grid-cols-10 w-full h-[48px] p-2 bg-white border-2 border-secondary rounded-[8px] text-secondary">
            <div className="col-span-2 flex gap-2 items-center report-box-select-all">
              <input type="checkbox"  onChange={toggleAllItemCheckBox} />
              <label className="font-bold">Serial Number</label>
            </div>
            <div className="text-center font-bold">Company</div>
            <div className="text-center font-bold">Branch</div>
            <div className="text-center font-bold ">Send By</div>
            <div className="text-center font-bold ">Date</div>
            <div className="text-center font-bold ">Time</div>
            <div className="text-center font-bold col-span-2 ">Problem</div>
            <div className="text-center font-bold">View Images</div>

          </div>

          {/* REPORT LIST */}
          <div className="report-box-list-container overflow-y-scroll scrollbar-hidden grid max-h-[552px] border-b-2 border-t-2 border-light gap-1 pt-1 pb-1">
          {filteredReports.map((report, index) => (
  <div
    className="report-box-list-item grid grid-cols-10 w-full h-fit items-center p-2 bg-white border-2 border-light rounded-[8px] cursor-pointer hover:brightness-90"
    key={index}
    onClick={() => handleItemCheck(report.report_id)}
  >
    {/* Report Number */}
    <span className="flex gap-2 items-center col-span-2">
      <input type="checkbox" checked={checkedItems[report.report_id] || false} onChange={() => handleItemCheck(report.report_id)} />
      <box-icon name="spray-can" type="regular" size="sm" color="#FD6E28"></box-icon>
      {report.item_id}
    </span>

    {/* Serial Number */}

    {/* Company */}
    <span className="text-center">{report.client_id}</span>

    {/* Branch */}
    <span className="text-center">{report.client_branch_id}</span>

    {/* Send By */}
    <span className="text-center ">{report.send_by}</span>

    {/* Date */}
    <span className="text-center">{report.createAt.split("T")[0].split("-").reverse().join("-")}</span>

    {/* Time */}
    <span className="text-center">{report.createAt.split("T")[1].split(".")[0]}</span>

    {/* Problem */}
    <span className="break-words col-span-2 overflow-y-scroll max-h-[48px]">{report.problem}</span>
<span>
    {/* เพิ่มคอลัมน์สำหรับปุ่ม Preview Image */}
    {report.image && (
      <div className="col-span-2 text-center flex justify-center items-center">
        <button
          className="bg-highlight text-white flex items-center justify-center rounded hover:bg-blue-700 w-1/2"
          onClick={(e) => {
            e.stopPropagation(); // Prevent the row click from being triggered
            showImagePreview(report.report_id);
          }}
        >
          <box-icon name='show' type='solid' color='white' ></box-icon>
        </button>
      </div>
    )}
    </span>
  </div>
))}
          </div>
        </div>

        <div className="report-box-footer flex justify-between w-full bottom-0 h-[48px] bg-white p-1 border-2 border-primary rounded-[8px]">
          <div className="report-box-checked-count flex justify-start items-center bg-highlight rounded px-2">
            <span className="text-white">{checkedCount} selected</span>
          </div>
          <div className="flex gap-2">
            <button className="px-2 text-white rounded bg-red-600 hover:brightness-110 flex items-center gap-1" onClick={handleConfirmReject}>
              <span>Reject</span>
              <box-icon name="x" type="regular" color="white"></box-icon>
            </button>
            <button className="px-2 text-white rounded bg-green-600 hover:brightness-110 flex items-center gap-1" onClick={handleConfirmAccept}>
              <span>Accept</span>
              <box-icon name="check" type="regular" color="white"></box-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportBox;
