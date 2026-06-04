import { useState, useEffect } from "react";
import { useAuth } from "../../Auth/AuthProvider";
import SweetAlert from "sweetalert2";
import "boxicons";
import "./UnassignedWork.css";

const UnassignedWorkAdmin = () => {
  const { user } = useAuth();
  const [workList, setWorkList] = useState([]);
  const [workerList, setWorkerList] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [selectedWorker, setSelectedWorker] = useState("");
  const [searchWorkerTerm, setSearchWorkerTerm] = useState("");
  const [searchWorkTerm, setSearchWorkTerm] = useState("");
  const [workerWorkCount, setWorkerWorkCount] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
  
    const fetchWorkCount = async () => {
      const counts = {};
      for (const worker of workerList) {
        try {
          const res = await fetch(
            `http://localhost:3000/report/getReportByUserFixing/${worker.username}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();
          counts[worker.username] = data.length;
        } catch (err) {
          console.error(`Error fetching work count for ${worker.username}:`, err);
          counts[worker.username] = 0;
        }
      }
      setWorkerWorkCount(counts);
    };
  
    if (workerList.length > 0) {
      fetchWorkCount(); // ดึงครั้งแรกก่อน
      const intervalId = setInterval(fetchWorkCount, 10000);
  
      return () => clearInterval(intervalId); 
    }
  }, [workerList]);
  

  useEffect(() => {
    fetch("http://localhost:3000/report/getReportByStatus/accepted", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(setWorkList)
      .catch((err) => console.error("Error fetching work data:", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/users/getWorkerUser", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(setWorkerList)
      .catch((err) => console.error("Error fetching worker data:", err));
  }, []);

  const toggleSelectedWorker = (Worker) => {
    setSelectedWorker(selectedWorker === Worker ? "" : Worker);
  };

  const handleItemCheck = (serial) => {
    setCheckedItems((prev) => ({
      ...prev,
      [serial]: !prev[serial],
    }));
  };

  const toggleAllItemCheckBox = (e) => {
    const checked = e.target.checked;
    const updatedCheckedItems = {};
    workList.forEach((work) => {
      updatedCheckedItems[work.report_id] = checked;
    });
    setCheckedItems(updatedCheckedItems);
  };

  const handleConfirmAssign = () => {
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    if (selectedWorker && checkedCount > 0) {
      confirmAssign(selectedWorker, checkedCount);
    } else {
      SweetAlert.fire({
        title: "Warning!",
        text: "Please select a Worker and unassigned work to assign.",
        icon: "warning",
        confirmButtonColor: "#FD6E28",
      });
    }
  };

  //ยังไม่สมบูรณ์ แต่ดูดี
  function confirmAssign(Worker) {
    SweetAlert.fire({
      title: "Are you sure?",
      text: `You need to assign work(s) to ${Worker} ?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#FD6E28",
      cancelButtonColor: "#B3B4AD",
      confirmButtonText: "Sure",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // ทำการอัปเดตสถานะและ assigner ที่ API
        const selectedReportIds = Object.keys(checkedItems).filter(
          (report_id) => checkedItems[report_id]
        );

        fetch("http://localhost:3000/report/updateReport/fixing", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ids: selectedReportIds,
            send_to: selectedWorker,
            user: user,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.message === "Report and items updated successfully") {
              SweetAlert.fire({
                title: "Success!",
                text: `work(s) assigned to ${Worker}`,
                icon: "success",
                confirmButtonColor: "#FD6E28",
              });
              // ลบ work ที่ assign แล้วออกจาก list
              setWorkList((prevList) =>
                prevList.filter(
                  (work) => !selectedReportIds.includes(work.report_id)
                )
              );
              // Reset checked items and selected Worker
              setCheckedItems({});
              setSelectedWorker("");
            } else {
              SweetAlert.fire({
                title: "Error!",
                text: data.message,
                icon: "error",
                confirmButtonColor: "#FD6E28",
              });
            }
          })
          .catch((error) => {
            SweetAlert.fire({
              title: "Error!",
              text: "An error occurred while assigning work.",
              icon: "error",
              confirmButtonColor: "#FD6E28",
            });
          });
      }
    });
  }

  const filteredworkerList = workerList.filter((worker) =>
    worker.username.toLowerCase().includes(searchWorkerTerm.toLowerCase())
  );

  const filteredWorkList = workList.filter((work) =>
    work.report_id.toLowerCase().includes(searchWorkTerm.toLowerCase())
  );

  return (
    <div className="unassigned-work-Admin flex gap-2 ">
      {/* Worker LIST */}
      <div className="Worker-list flex flex-col gap-2 flex-1 bg-white p-1 drop-shadow-md rounded-lg ">
        <div className="Worker-list-bar bg-secondary p-2 rounded-[8px] drop-shadow flex items-center border-2 border-white justify-between sticky top-0 z-10 " >
          <div className="Worker-list-header flex gap-1 justify-center items-center ">
            <box-icon
              name="user"
              type="regular"
              size="md"
              color="white"
            ></box-icon>
            <h2 className="text-white">Worker</h2>
          </div>
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search Worker..."
              className="rounded px-2 py-1 text-sm text-secondary outline-none"
              value={searchWorkerTerm}
              onChange={(e) => setSearchWorkerTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="Worker-list-container grid gap-1 max-h-[600px] overflow-y-scroll border-t-2 border-b-2 border-secondary pt-1 pb-1">
          {filteredworkerList.map((Worker) => (
            <div
              className={`Worker-list-item grid grid-cols-4 w-full h-[48px] justify-between items-center p-2 border-2 border-secondary rounded-[8px] cursor-pointer drop-shadow transition-all duration-200 ${
                selectedWorker === Worker.username
                  ? "text-white bg-secondary"
                  : "text-black bg-white"
              }`}
              key={Worker._id}
              onClick={() => toggleSelectedWorker(Worker.username)}
            >
              <span className="col-span-2 flex gap-2 items-center">
                <box-icon
                  name="user-circle"
                  type="regular"
                  size="sm"
                  color={
                    selectedWorker === Worker.username ? "white" : "#473366"
                  }
                ></box-icon>
                <span>{Worker.display_name}</span>
              </span>
              <span>
                <span>
                  {Worker.username}
                  <span className="text-xs text-gray-500 ml-2">
                    ({workerWorkCount[Worker.username] || 0} works)
                  </span>
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* UNASSIGNED WORK LIST */}
      <div className="unassigned-work-list flex flex-col gap-2 min-w-fit flex-1 bg-white p-1 drop-shadow-md rounded-lg">
        <div className="unassigned-work-list-bar bg-highlight p-2 rounded-[8px] drop-shadow flex items-center justify-between sticky top-0 z-10 text-nowrap">
          <div className="unassigned-work-list-header flex gap-1 justify-center items-center">
            <box-icon
              name="list-plus"
              type="regular"
              size="md"
              color="white"
            ></box-icon>
            <h2 className="text-white">Unassigned Work</h2>
          </div>
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search work..."
              className="rounded px-2 py-1 text-sm text-highlight outline-none"
              value={searchWorkTerm}
              onChange={(e) => setSearchWorkTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="unassigned-work-list-container flex flex-col max-h-[552px] overflow-y-scroll border-b-2 border-t-2 border-highlight space-y-1 pt-1 pb-1">
          {filteredWorkList.map((work) => (
            <div
              className="unassigned-work-list-item grid grid-cols-10 overflow-scroll w-full h-[48px] justify-between items-center p-2 bg-white border-2 border-highlight rounded-[8px] drop-shadow cursor-pointer hover:brightness-90 transition-all duration-200"
              key={work.report_id}
              onClick={() => handleItemCheck(work.report_id)}
            >
              <span className="flex gap-2 items-center col-span-3">
                <input
                  type="checkbox"
                  checked={checkedItems[work.report_id] || false}
                  onChange={() => handleItemCheck(work.report_id)}
                />
                <box-icon
                  name="spray-can"
                  type="regular"
                  size="sm"
                  color="#FD6E28"
                ></box-icon>
                {work.report_id}
              </span>
              <span className="col-span-2">{work.client_id}</span>
              <span className="col-span-2">{work.client_branch_id}</span>
              <span className="text-center text-overflow-ellipsis  ">
                {work.createAt.split("T")[0].split("-").reverse().join("-")}
              </span>
              <span className="text-center text-overflow-ellipsis ">
                {work.createAt.split("T")[1].split(".")[0]}
              </span>
            </div>
          ))}
        </div>

        <div className="unassigned-work-footer flex justify-between w-full bottom-0 h-[48px] bg-white p-1 border-2 border-highlight rounded-[8px]">
          <div className="unassigned-work-checked-count flex justify-start items-center bg-highlight rounded px-2">
            <span className="text-white">
              {Object.values(checkedItems).filter(Boolean).length} selected
            </span>
          </div>
          <button
            className="flex justify-center items-center gap-1 px-2 text-white rounded bg-green-600 hover:brightness-110"
            onClick={handleConfirmAssign}
          >
            <span>Assign Work</span>
            <box-icon name="plus" type="regular" color="white"></box-icon>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnassignedWorkAdmin;
