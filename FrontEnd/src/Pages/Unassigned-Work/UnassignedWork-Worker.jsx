import { useRef, useState, useEffect } from "react";
import SweetAlert from "sweetalert2";
import { useAuth } from "../../Auth/AuthProvider";
import axios from "axios";
import "boxicons";
import "./UnassignedWork.css";
import placeholderImg from "../../assets/img/placeholder.png";

const UnassignedWork = () => {
  const filterBoxRef = useRef();
  const [currentPage, setCurrentPage] = useState(1);
  const [workList, setWorkList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const { user } = useAuth();

  const itemsPerPage = 8;

  useEffect(() => {
    axios
      .get("http://localhost:3000/report/getReportByStatus/accepted", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setWorkList(res.data))
      .catch((err) => console.error("Error fetching reports", err));
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCompanyFilterChange = (e) => {
    const company = e.target.name;
    setSelectedCompanies((prev) =>
      prev.includes(company)
        ? prev.filter((c) => c !== company)
        : [...prev, company]
    );
    setCurrentPage(1);
  };

  const filteredData = workList.filter((item) => {
    const matchesSearch = item.item_id
      .toString()
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedCompanies.length === 0 ||
      selectedCompanies.includes(item.client_id);
    return matchesSearch && matchesFilter;
  });

  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const changePage = (page) => {
    setCurrentPage(page);
  };

  const getPaginationRange = () => {
    const start = Math.max(currentPage - 1, 1);
    const end = Math.min(currentPage + 1, totalPages);
    if (end - start < 2) {
      if (start === 1) return [1, 2, 3].slice(0, totalPages);
      if (end === totalPages)
        return [totalPages - 2, totalPages - 1, totalPages];
    }
    return [start, start + 1, start + 2];
  };

  const toggleFilterBox = () => {
    filterBoxRef.current.classList.toggle("hidden");
  };

  const handleAccept = async (id) => {
    const result = await SweetAlert.fire({
      title: "Are you sure?",
      text: "You need to accept this work?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#FD6E28",
      cancelButtonColor: "#B3B4AD",
      confirmButtonText: "Sure",
    });

    if (result.isConfirmed) {
      try {
        await axios.put("http://localhost:3000/report/updateReport/fixing", {
          ids: [id],
          send_to: user.username,
          user: user,
        },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
        SweetAlert.fire({
          title: "Congratulations!",
          text: "Work accepted!",
          icon: "success",
          confirmButtonColor: "#FD6E28",
        });
        setWorkList((prev) => prev.filter((item) => item.report_id !== id));
      } catch (err) {
        SweetAlert.fire({
          title: "Error",
          text: "Failed to accept work",
          icon: "error",
        });
      }
    }
  };

  const handleViewDetails = (report) => {
    SweetAlert.fire({
      title: `<strong>Report ID: ${report.report_id}</strong>`,
      html: `
        <div  style="text-align: left; font-size: 20px;">
          <p><strong>Item ID:</strong> ${report.item_id}</p>
          <p><strong>Client:</strong> ${report.client_id}</p>
          <p><strong>Branch:</strong> ${report.client_branch_id}</p>
          <p><strong>Date:</strong> ${report.createAt.split("T")[0].split("-").reverse().join("-")}</p>
          <p><strong>Time:</strong> ${report.createAt.split("T")[1].split(".")[0]}</p>
          <p><strong>Problem:</strong> ${report.problem}</p>
          <p><strong>Status:</strong> ${report.status}</p>
        </div>
      `,
      imageUrl: placeholderImg,
      imageWidth: 150,
      imageHeight: 150,
      imageAlt: "Report Image",
      confirmButtonColor: "#FD6E28",
    });
  };

  const filterList = {
    Company: [...new Set(workList.map((work) => work.client_id))],
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="unassigned-work-list-bar bg-primary p-2 rounded-[8px] drop-shadow flex items-center justify-between sticky top-0 z-10">
        <div className="unassigned-work-list-header flex gap-2 justify-center items-center">
          <box-icon
            name="list-plus"
            type="regular"
            size="md"
            color="white"
          ></box-icon>
          <h2 className="text-white">Unassigned Work</h2>
        </div>
        <div className="unassigned-work-list-tool flex gap-2">
          <div className="unassigned-work-search flex flex-col justify-center items-center gap-2">
            <div className="unassigned-work-search-box flex gap-2">
              <button onClick={toggleFilterBox}>
                <box-icon
                  name="filter"
                  type="regular"
                  size="sm"
                  color="#FD6E28"
                ></box-icon>
              </button>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button>
                <box-icon
                  name="search"
                  type="regular"
                  size="sm"
                  color="#FD6E28"
                ></box-icon>
              </button>
            </div>
            <div className="filter-box hidden" ref={filterBoxRef}>
              {Object.keys(filterList).map((key) => (
                <div className="filter-item flex flex-col" key={key}>
                  <h4 className="text-white w-full text-center bg-primary rounded-[4px]">
                    {key}
                  </h4>
                  {filterList[key].map((item) => (
                    <div className="filter-list" key={item}>
                      <input
                        type="checkbox"
                        name={item}
                        id={item}
                        checked={selectedCompanies.includes(item)}
                        onChange={handleCompanyFilterChange}
                      />
                      <label htmlFor={item}>{item}</label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="unassigned-work-card-container grid grid-cols-4 gap-2">
        {currentData.length > 0 ? (
          currentData.map((item, index) => (
            <div
              className="unassigned-work-card h-fit flex flex-col items-center bg-white drop-shadow-md"
              key={index}
            >
              <div className="unassigned-work-card-detail flex flex-col w-full h-full">
                <div className="unassigned-work-card-header flex justify-center items-center h-1/2">
                  <img
                    className="w-full h-2/3 object-cover rounded-lg"
                    src={placeholderImg}
                    alt="report-img"
                  />
                </div>
                <div className="unassigned-work-card-body flex flex-col justify-center items-center">
                  <h3 className="text-secondary font-bold">{item.client_id}</h3>
                  <h4 className="italic">{item.client_branch_id}</h4>
                 
                  <div className="flex items-center justify-center">
                    <box-icon
                      name="spray-can"
                      type="regular"
                      color="#FD6E28"
                      size="sm"
                    ></box-icon>
                    <span className="font-bold">{item.item_id}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <box-icon
                      name="file"
                      type="regular"
                      color="#FD6E28"
                      size="sm"
                    ></box-icon>
                    <span className="text-sm">{item.report_id}</span>
                  </div>
                </div>
                <div className="unassigned-work-card-footer flex flex-col w-full gap-1 py-1">
                  <div className="flex w-full gap-1">
                    <button
                      className="edit-button flex justify-center items-center w-full text-white p-1 rounded gap-2 bg-secondary"
                      onClick={() => handleViewDetails(item)}
                    >
                      <box-icon
                        name="show"
                        type="regular"
                        color="white"
                      ></box-icon>
                      <span>View Details</span>
                    </button>
                    <button
                      className="submit-button flex justify-center items-center w-full text-white p-1 rounded gap-2 bg-green-600 hover:brightness-110"
                      onClick={() => handleAccept(item.report_id)}
                    >
                      <box-icon
                        name="plus"
                        type="regular"
                        color="white"
                      ></box-icon>
                      <span>Accept</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center col-span-4 p-6 rounded-lg bg-white drop-shadow-md">
            <box-icon
              name="edit-alt"
              type="solid"
              color="#2f6690"
              size="lg"
            ></box-icon>
            <h2 className="text-lg font-semibold">No Reports at the Moment</h2>
            <p className="text-sm text-secondary">
              Take this time to relax and recharge.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination w-full bg-white drop-shadow-sm p-1 rounded-lg flex justify-center gap-1">
          <button onClick={() => changePage(1)} disabled={currentPage === 1}>
            <box-icon type="solid" name="chevrons-left"></box-icon>
          </button>
          <button
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <box-icon type="solid" name="chevron-left"></box-icon>
          </button>
          {getPaginationRange().map((page) => (
            <button
              key={page}
              onClick={() => changePage(page)}
              className={currentPage === page ? "font-bold underline" : ""}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <box-icon type="solid" name="chevron-right"></box-icon>
          </button>
          <button
            onClick={() => changePage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <box-icon type="solid" name="chevrons-right"></box-icon>
          </button>
        </div>
      )}
    </div>
  );
};

export default UnassignedWork;
