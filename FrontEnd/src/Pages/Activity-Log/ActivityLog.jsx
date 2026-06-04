import React, { useEffect, useState } from "react";
import DataTable from "../../Component/DataTable/DataTable";
import Status from "../../Component/Status/Status";
import { useAuth } from "../../Auth/AuthProvider";

const ActivityLog = () => {
  const { user } = useAuth();
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      try {
        const endpoint =
          user.role === "Admin" || user.role === "Super Admin"
            ? "http://localhost:3000/activitylog/all"
            : "http://localhost:3000/activitylog/worker";

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Unexpected response format:", data);
          return;
        }

        const formattedData = data.map((item) => [
          item.log_id,
          item.date?.split("T")[0] ?? "-",
          item.date?.split("T")[1]?.split(".")[0] ?? "-",
          item.activity,
          item.username,
          item.role,
        ]);

        setActivityLog(formattedData);
      } catch (error) {
        console.error("Error fetching activity log:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.role]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-2 w-full h-fit rounded drop-shadow">
      <div className="w-full rounded drop-shadow">
        <Status role={user.role} company={user.client} />
      </div>
      <div className="w-full rounded drop-shadow">
        <div className="bg-white p-1 rounded drop-shadow">
          <DataTable
            tIcon={"revision"}
            tName={"Activity Log"}
            title={["Log_ID", "Date", "Time", "Activity", "Username", "Role"]}
            data={activityLog}
            hasButton={false}
            itemPerPage={20}
          />
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
