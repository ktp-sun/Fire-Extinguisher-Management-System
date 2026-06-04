import React, { useState, useEffect } from "react";
import { useAuth } from "../../Auth/AuthProvider";
import DataTable from "../../Component/DataTable/DataTable";
import Status from "../../Component/Status/Status";
import "boxicons";

const InventoryWorker = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requestOptions = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          method: "GET",
          redirect: "follow",
        };
        const response = await fetch(
          `http://${window.location.hostname}:3000/item/getAllItem`,
          requestOptions
        );
        const data = await response.json();
        const formattedData = data.map((item) => [
          item.item_id,
          item.client_id,
          item.client_branch_id,
          item.item_location,
          item.item_brand,
          item.item_capacity,
          item.item_color,
          item.item_type,
          item.item_class,
          item.item_status,
        ]);
        setInventory(formattedData);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const intervalId = setInterval(async () => {
      await fetchData();
    }, 1000);
    return () => clearInterval(intervalId);
  }, [user.company]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col w-full drop-shadow rounded-[8px]">
      <div className="bg-white rounded-[8px] drop-shadow">
        <Status role={user.role} company={user.client} branch={user.selectedBranch} />
      </div>
      <div className="mt-4 bg-white p-1 rounded-[8px] drop-shadow">
        <DataTable
          tIcon={"spray-can"}
          colIcon={"spray-can"}
          tName="Fire Extinguisher List"
          title={[
            "item_id",
            "client_id",
            "client_branch_id",
            "item_location",
            "item_brand",
            "item_capacity",
            "item_color",
            "item_type",
            "item_class",
            "item_status",
          ]}
          data={inventory}
          hasExport={true}
          hasEdit={true}
          hasAddItem={true}
          hasQr={true}
          hasButton={false}
        />
      </div>
    </div>
  );
};

export default InventoryWorker;

