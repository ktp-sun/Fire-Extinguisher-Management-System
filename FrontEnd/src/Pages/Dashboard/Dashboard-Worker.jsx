import { useRef, useState, useEffect } from "react";
import axios from "axios";
import SweetAlert from "sweetalert2";
import "boxicons";
import "./Dashboard-Worker.css";
import { useAuth } from "../../Auth/AuthProvider";
import placeholderImg from "../../assets/img/placeholder.png";

const DashboardWorker = () => {
  const { user } = useAuth();
  const filterBoxRef = useRef();
  const [currentPage, setCurrentPage] = useState(1);
  const [workList, setWorkList] = useState([]);
  const itemsPerPage = 8;

  const currentData = workList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const filterList = {
    Company: [...new Set(workList.map((work) => work.company))],
  };
  const totalPages = Math.ceil(workList.length / itemsPerPage);

  const changePage = (page) => {
    setCurrentPage(page);
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/report/getReportByUserFixing/${user.username}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const transformed = res.data.map((report) => ({
        report_id: report.report_id,
        serial: report.item_id,
        company: report.client_id,
        branch: report.client_branch_id,
        date: new Date(report.createAt).toLocaleDateString(),
      }));
      setWorkList(transformed);
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const getPaginationRange = () => {
    const start = Math.max(currentPage - 1, 1);
    const end = Math.min(currentPage + 1, totalPages);
    if (end - start < 2) {
      if (start === 1) {
        return [1, 2, 3].slice(0, totalPages);
      } else if (end === totalPages) {
        return [totalPages - 2, totalPages - 1, totalPages];
      }
    }
    return [start, start + 1, start + 2];
  };

  const toggleFilterBox = () => {
    filterBoxRef.current.classList.toggle("hidden");
  };

  const handleViewDetails = async (report) => {
    try {
      let imageUrl = placeholderImg;
      let locationData = null;
  
      try {
        const res = await fetch(`http://localhost:3000/getImage/${report.report_id}`);
        if (res.ok) {
          const blob = await res.blob();
          imageUrl = URL.createObjectURL(blob);
        }
      } catch (error) {
        console.error("Error fetching image:", error);
      }
  
      try {
        const locationRes = await fetch(
          `http://localhost:3000/company/getLocation/${report.company}/${report.branch}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
  
        if (locationRes.ok) {
          locationData = await locationRes.json();
        } else {
          throw new Error('Failed to fetch location');
        }
      } catch (error) {
        console.error("Error fetching location for Google Maps:", error);
      }
  
      SweetAlert.fire({
        title: `<strong>Report ID: ${report.report_id}</strong>`,
        html: `
          <div style="text-align: left; font-size: 14px;">
            <p><strong>Item ID:</strong> ${report.serial}</p>
            <p><strong>Client:</strong> ${report.company}</p>
            <p><strong>Branch:</strong> ${report.branch}</p>
            <p><strong>Date:</strong> ${report.date}</p>
            <p><strong>Location:</strong> ${locationData ? `${locationData.province} ${locationData.district} ${locationData.street} ${locationData.alley || ''} ${locationData.building_number} ${locationData.postal_code}` : ''}</p>
          </div>
        `,
        imageUrl: imageUrl,
        imageWidth: 400,
        imageHeight: 200,
        imageAlt: "Report Image",
        confirmButtonColor: "#FD6E28",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Open in Google Maps",
      }).then(async (result) => {
        if (result.isConfirmed && locationData) {
          const mapUrl = `https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`;
          window.open(mapUrl, "_blank");
        } else if (result.isConfirmed && !locationData) {
          SweetAlert.fire({
            title: "Error",
            text: "No location data available.",
            icon: "error",
            confirmButtonColor: "#FD6E28",
          });
        }
      });
  
    } catch (error) {
      console.error("Error handling view details:", error);
      SweetAlert.fire({
        title: "Error",
        text: "Something went wrong while fetching the image or location.",
        icon: "error",
        confirmButtonColor: "#FD6E28",
      });
    }
  };
  
  

 const handleSubmit = async (reportId) => {
  const result = await SweetAlert.fire({
    title: "Are you sure?",
    text: "You need to submit work?",
    icon: "question",
    input: "text",
    inputLabel: "Note (optional)",
    inputPlaceholder: "Enter your note here...",
    showCancelButton: true,
    confirmButtonColor: "#FD6E28",
    cancelButtonColor: "#B3B4AD",
    confirmButtonText: "Sure",
    preConfirm: (note) => {
      if (note.length > 255) {
        SweetAlert.showValidationMessage("Note is too long (max 255 characters)");
        return false;
      }
      return note;
    },
  });

  if (!result.isConfirmed) return;

  try {
    const note = result.value || ""; // ค่า note จาก input

    await axios.put(
      "http://localhost:3000/report/updateReport/done",
      {
        ids: [reportId],
        user: user,
        note: note, 
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const res = await axios.get(
      `http://localhost:3000/report/getReportByUserFixing/${user.username}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const transformed = res.data.map((report) => ({
      report_id: report.report_id,
      serial: report.item_id,
      company: report.client_id,
      branch: report.client_branch_id,
      date: new Date(report.createAt).toLocaleDateString(),
    }));

    setWorkList(transformed);

    SweetAlert.fire({
      title: "Congratulations!",
      text: "Your work has been submitted!",
      icon: "success",
      confirmButtonColor: "#FD6E28",
    });

  } catch (error) {
    console.error("Error submitting or fetching report:", error);
    SweetAlert.fire({
      title: "Error",
      text: "Failed to submit the report.",
      icon: "error",
      confirmButtonColor: "#FD6E28",
    });
  }
};


  return (
    <div className="flex flex-col gap-2">
      <div className="work-list-bar bg-primary p-2 rounded-[8px] drop-shadow flex items-center justify-between sticky top-0 z-10">
        <div className="work-list-header flex gap-2 justify-center items-center">
          <box-icon
            name="wrench"
            type="solid"
            size="md"
            color="white"
          ></box-icon>
          <h2 className="text-white">Work List</h2>
        </div>
        <div className="work-list-tool flex gap-2">
          <div className="work-search flex flex-col justify-center items-center gap-2">
            <div className="search-box flex gap-2">
              <button
                className="flex justify-center items-center"
                onClick={toggleFilterBox}
              >
                <box-icon
                  name="filter"
                  type="regular"
                  size="sm"
                  color="#FD6E28"
                ></box-icon>
              </button>
              <input type="text" placeholder="Search" name="work-search" />
              <button className="flex justify-center items-center">
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
                      <input type="checkbox" name={item} id={item} />
                      <label htmlFor={item}>{item}</label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="work-card-container grid grid-cols-4 gap-2">
        {currentData.length > 0 ? (
          currentData.map((item, index) => (
            <div
              className="work-card h-fit flex flex-col items-center flex-1 bg-white drop-shadow-md"
              key={index}
            >
              <div className="work-card-detail flex flex-col w-full h-full">
                <div className="work-card-header flex flex-col justify-center items-center h-1/2">
                  <div className="work-card-img flex justify-center items-center w-full h-fit">
                    <img
                      className="w-full h-2/3 object-cover rounded-lg"
                      src={placeholderImg}
                      alt="report-img"
                    />
                  </div>
                </div>
                <div className="work-card-body flex flex-col justify-center items-center">
                  <h3 className="text-secondary text-nowrap">{item.company}</h3>
                  <h4 className="text-dark">{item.branch}</h4>
                  <div className="flex items-center justify-center">
                    <box-icon
                      name="time"
                      type="regular"
                      color="#FD6E28"
                      size="sm"
                    ></box-icon>
                    <span>{item.date}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <box-icon
                      name="spray-can"
                      type="regular"
                      color="#FD6E28"
                      size="sm"
                    ></box-icon>
                    <span className="font-bold">{item.serial}</span>
                  </div>
                </div>
                <div className="work-card-footer flex flex-col w-full gap-1 py-1">
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
                      className="submit-button flex w-full justify-center items-center text-white p-1 rounded gap-2 bg-green-600 hover:brightness-110"
                      onClick={() => handleSubmit(item.report_id)}
                    >
                      <box-icon
                        name="check"
                        type="regular"
                        color="white"
                      ></box-icon>
                      <span>Submit</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center col-span-4 p-6 rounded-lg bg-white drop-shadow-md">
            <box-icon
              name="archive"
              type="regular"
              color="#2f6690"
              size="lg"
            ></box-icon>
            <h2 className="text-dark text-xl font-semibold mt-2 text-center">
              No tasks available at the moment.
              <br />
              Please wait for an assignment from the Admin.
            </h2>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination w-full bg-white drop-shadow-sm p-1 rounded-lg flex justify-center items-center gap-2 mt-2">
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
              className={`px-2 py-1 rounded ${
                currentPage === page ? "bg-primary text-white" : ""
              }`}
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

export default DashboardWorker;
