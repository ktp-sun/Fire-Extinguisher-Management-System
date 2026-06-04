import React from "react";
import Status from "../../Component/Status/Status";
import { useAuth } from "../../Auth/AuthProvider";
import { Bar } from "react-chartjs-2"; // Import the Bar chart
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardSuperAdmin = () => {
  const { user } = useAuth();

  const testData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Total Installed",
        data: [235, 244, 324, 334, 454, 518, 624, 683, 879, 945, 1005, 1218],
        backgroundColor: "#F4A261",
        borderColor: "#FD6E28", 
        borderWidth: 2, 
      },
      {
        label: "Currently in Use",
        data: [200, 220, 300, 315, 400, 470, 580, 635, 800, 870, 940, 1120],
        backgroundColor: "#1F2A44",
        borderColor: "#0f1e42", 
        borderWidth: 2,
      },
      {
        label: "Total Uninstalled",
        data: [35, 24, 24, 19, 54, 48, 44, 48, 79, 75, 65, 98],
        backgroundColor: "#DF7A61",
        borderColor: "#ff2a11",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: "Item Change Report",
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 200,
        },
      },
    },
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full rounded-lg drop-shadow">
        <Status
          role={user.role}
          company={user.client}
        />
      </div>
      <div className="chart-container w-full bg-white p-1 rounded-lg drop-shadow">
      <Bar data={testData} options={chartOptions} />
      </div>
    </div>
  );
};

export default DashboardSuperAdmin;
