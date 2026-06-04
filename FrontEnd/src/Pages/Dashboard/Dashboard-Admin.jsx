import React, { useEffect, useState } from "react";
import "boxicons";
import DataTable from "../../Component/DataTable/DataTable.jsx";
import Status from "../../Component/Status/Status.jsx";
import { useAuth } from "../../Auth/AuthProvider.jsx";

const fetchReport = async () => {
  try {
    const requestOptions = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      method: "GET",
      redirect: "follow",
    };
    const response = await fetch(
      `http://${window.location.hostname}:3000/report/getReportByStatus/pending`,
      requestOptions
    );
    const data = await response.json();
    const formattedData = data.map((item) => [
      item.item_id,
      item.createAt.split("T")[0],
      item.createAt.split("T")[1].split(".")[0],
      item.problem,
    ]);
    return formattedData;
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    return []
  }
};

const fetchAccepted = async () => {
  try {
    const requestOptions = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      method: "GET",
      redirect: "follow",
    };
    const response = await fetch(
      `http://${window.location.hostname}:3000/report/getReportByStatus/done`,
      requestOptions
    );
    const data = await response.json();
    const formattedData = data.map((item) => [
      item.item_id,
      item.send_to,
      item.createAt.split("T")[0],
      item.createAt.split("T")[1].split(".")[0],
    ]);
    return formattedData;
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    return []
  }
};

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [submittedWork, setSubmittedWork] = useState([]);
  const [testUnReadReport, setTestUnReadReport] = useState([]);
  useEffect(() => {
    (async () => {
      setTestUnReadReport(await fetchReport())
      setSubmittedWork(await fetchAccepted())
    })()
  }, []);
  return (
    <div className="flex flex-col w-full h-fit rounded drop-shadow gap-2">
      <div className="w-full rounded drop-shadow">
      <Status
          role={user.role}
          company={user.client}
        />
      </div>
      <div className=" dashboard-container flex w-full rounded drop-shadow">
        <div className="big-item">
          <div className="small-item-wrapper">
            <div className="small-item">
              <DataTable
                tIcon="wrench"
                colIcon={"wrench"}
                tName={"Submitted Work"}
                title={["Serial Number", "Worker Name", "Date", "Time"]}
                data={submittedWork}
                hasButton={false}
                itemPerPage={10}
              ></DataTable>
            </div>
          </div>
        </div>
        <div className="big-item">
          <div className="small-item-wrapper">
            <div className="small-item">
              <DataTable
                colIcon={"news"}
                tIcon={"news"}
                tName={"Report"}
                title={["Serial Number", "Date", "Time", "Problem"]}
                data={testUnReadReport}
                hasButton={false}
                itemPerPage={10}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
