import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import DataTable from "../../Component/DataTable/DataTable";
import CreateForm from "../../Component/CreateForm";
import Status from "../../Component/Status/Status";
import { useAuth } from "../../Auth/AuthProvider";

const fetchData = async (user) => {
  try {
    const [inbox, inventory, nextCheck, lastCheck] = await Promise.all([
      fetch(`http://${window.location.hostname}:3000/report/getReportByBranch/${user.client}/${user.selectedBranch}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
        .then(res => res.json())
        .then(data => data.map(item => [item.report_id, item.item_id, item.createAt.split("T")[0], item.createAt.split("T")[1].split(".")[0], item.status])),

      fetch(`http://${window.location.hostname}:3000/item/getItemList/${user.client}/${user.selectedBranch}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
        .then(res => res.json())
        .then(data => data.map(item => [item.item_id, item.item_brand, item.item_status])),

      fetch(`http://${window.location.hostname}:3000/company/getNextCheck/${user.client}/${user.selectedBranch}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
        .then(res => res.json())
        .then(data => {
          const [day, month, year] = data.split("/");
          const receivedDate = new Date(year, month - 1, day);
          return Math.ceil((receivedDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        }),

      fetch(`http://${window.location.hostname}:3000/company/getLastCheck/${user.client}/${user.selectedBranch}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
        .then(res => res.json())
        .then(data => data.map(date => [date]))
    ]);

    return { inbox, inventory, nextCheck, lastCheck };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      inbox: [],
      inventory: [],
      nextCheck: null,
      lastCheck: []
    };
  }
};

const DashboardMember = () => {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [testActivity, setTestActivity] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [checkUp, setCheckUp] = useState(null);
  const [lastCheck, setLastCheck] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      user.selectedBranch = user.selectedBranch || user.client_access[0];
      const { inbox, inventory, nextCheck, lastCheck } = await fetchData(user);
      setTestActivity(inbox);
      setInventory(inventory);
      setCheckUp(nextCheck);
      setLastCheck(lastCheck);
    };

    loadData();
  }, [user.client, user.selectedBranch]);

  const handleCloseForm = () => {
    setShowCreateForm(false);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const response = await fetch("http://localhost:3000/report/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit form");

      setShowCreateForm(false);

      const { inbox, inventory, nextCheck, lastCheck } = await fetchData(user);
      setTestActivity(inbox);
      setInventory(inventory);
      setCheckUp(nextCheck);
      setLastCheck(lastCheck);

    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <>
      <div className={`flex flex-col w-full rounded drop-shadow relative ${showCreateForm ? 'blur-background' : ''}`}>
        {/* ส่วน UI หลัก */}
        <div className="w-full rounded drop-shadow">
          <Status
            role={user.role}
            company={user.client}
            branch={user.selectedBranch}
          />
        </div>

        <div className="dashboard-container flex w-full rounded drop-shadow mt-4">
          {/* กล่องซ้าย */}
          <div className="big-item">
            {/* Report Activity */}
            <div className="small-item-wrapper">
              <div className="small-item h-fit">
                <DataTable
                  tIcon="revision"
                  tName="Report Activity"
                  colIcon="import"
                  title={["Report ID", "Item ID", "Date", "Time", "Status"]}
                  data={testActivity}
                  hasButton={false}
                  itemPerPage={4}
                  hasSearch={false}
                />
              </div>
            </div>

            {/* กล่องย่อยขวา */}
            <div className="small-item-wrapper">
              {/* Check Up Info */}
              <div className="small-item">
                <div className="countdown w-full flex justify-center items-center flex-col gap-2">
                  <div className="flex justify-center items-center">
                    <box-icon name="timer" color="#ff6700" size="lg"></box-icon>
                    <h1 className="text-primary">{checkUp !== null ? checkUp : "N/A"}</h1>
                  </div>
                  <span className="flex justify-center items-end">
                    <h2>Days</h2>
                    <h4 className="ml-2">until next Check Up</h4>
                  </span>
                </div>

                <DataTable
                  title={["Last Check"]}
                  colIcon="check-square"
                  data={lastCheck}
                  hasButton={false}
                  hasPagination={false}
                  itemPerPage={4}
                  hasSearch={false}
                />
              </div>

              {/* Send Request Button */}
              <div className="small-item flex flex-col justify-center items-center gap-4">
                <span className="report-icon">
                  <box-icon name="comment-error" size="6rem" color="#ff6700"></box-icon>
                </span>
                <div className="flex flex-col justify-center items-center">
                  <h2 className="text-dark">Send Request</h2>
                  <span className="text-gray">Having problems with our product?</span>
                  <span className="text-gray">Send us request for an action</span>
                </div>
                <button
                  className="send-button flex justify-center items-center bg-secondary p-2"
                  onClick={() => setShowCreateForm(true)}
                >
                  <span className="mr-2 text-white">Send</span>
                  <box-icon color="white" name="send"></box-icon>
                </button>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="long-item">
            <DataTable
              tIcon="spray-can"
              tName="Inventory"
              colIcon="spray-can"
              title={["Serial Number", "Brand", "Status"]}
              data={inventory}
              hasButton={true}
              itemPerPage={10}
              hasSearch={false}
            />
          </div>
        </div>
      </div>

      {/* Create Form Popup */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/10"
            onClick={handleCloseForm}
          />
          <div
            className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl bg-white border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <CreateForm onClose={handleCloseForm} onSubmit={handleFormSubmit} />
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardMember;