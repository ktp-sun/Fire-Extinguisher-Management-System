// src/Pages/Inventory/Inventory-Member.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../Auth/AuthProvider";
import DataTable from "../../Component/DataTable/DataTable";
import Status from "../../Component/Status/Status";

const InventoryMember = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        user.selectedBranch
          ? user.selectedBranch
          : (user.selectedBranch = user.client_access[0]);
        const response = await fetch(
          `http://${window.location.hostname}:3000/item/getItemList/${user.client}/${user.selectedBranch}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
          }
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
  // }, [user.company, user.selectedBranch]);
  },[]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col w-full drop-shadow rounded-[8px]">
      <div className="bg-white rounded-[8px] drop-shadow">
        <Status
          role={user.role}
          company={user.client}
          branch={
            user.selectedBranch
              ? user.selectedBranch
              : (user.selectedBranch = user.client_access[0])
          }
        />
      </div>

      <div className="mt-4 bg-white p-1 rounded-[8px] drop-shadow">
        <DataTable
          tIcon="spray-can"
          colIcon="spray-can"
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
          hasButton={true}
          data={inventory}
          hasExport={true}
          hasQr={true}
        />
      </div>
    </div>
  );
};

export default InventoryMember;

