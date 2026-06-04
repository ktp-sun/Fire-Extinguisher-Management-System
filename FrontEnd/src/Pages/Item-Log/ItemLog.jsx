import React, { useEffect, useState } from 'react';
import DataTable from '../../Component/DataTable/DataTable';
import Status from '../../Component/Status/Status';
import { useAuth } from '../../Auth/AuthProvider';

const ItemLog = () => {
    const { user } = useAuth();
    const [activityLog, setActivityLog] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3000/itemlog/getAllLog`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                          },
                    }
                );
                const data = await response.json();
                const formattedData = data.map((item) => [
                    item.log_id,
                    item.item_id,
                    item.date.split("T")[0],
                    item.date.split("T")[1].split(".")[0],
                    item.activity,
                    item.username,
                    item.role
                ]);
                
                setActivityLog(formattedData);
            } catch (error) {
                console.error("Error fetching inventory data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;
    return (
        <div className="flex flex-col gap-2 w-full h-fit rounded drop-shadow">
            <div className='w-full rounded drop-shadow'>
                <Status role={user.role} company={user.client} />
            </div>
            <div className="w-full rounded drop-shadow">
                <div className='bg-white p-1 rounded drop-shadow'>
                    <DataTable tIcon={"revision"} tName={"Activity Log"} title={["Log_ID", "Item ID", "Date", "Time", "Activity", "Username", "Role"]} data={activityLog} hasButton={false} itemPerPage={20}/>
                </div>
            </div>
        </div>
    );
}

export default ItemLog;