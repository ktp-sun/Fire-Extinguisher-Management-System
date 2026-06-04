import "./App.css";
import Layout from "./Layout/Layout.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React from "react";

import AuthProvider from "./Auth/AuthProvider.jsx";
import { ProtectedRoute } from "./Auth/ProtectedRoute.jsx";

import ProductPage from "./Pages/Product/ProductPage";
import LoginPage from "./Pages/Login/Login.jsx";
import Dashboard from "./Pages/Dashboard/Dashboard.jsx";
import Inventory from "./Pages/Inventory/Inventory.jsx";
import MemberManagement from "./Pages/Member-Management/Member-Management.jsx";
import ReportBox from "./Pages/Report-Box/ReportBox.jsx";
import UnassignedWork from "./Pages/Unassigned-Work/UnassignedWork.jsx";
import SubmittedWork from "./Pages/Submitted-Work/Submitted-Work.jsx";
import Setting from "./Pages/Setting/Setting.jsx";
import ActivityLog from "./Pages/Activity-Log/ActivityLog";
import ItemLog from "./Pages/Item-Log/ItemLog";
import NotFound from './Pages/Not-Found/Not-Found';
import ClientManagement from "./Pages/Client-Management/Client-Management.jsx";

const router = createBrowserRouter(
  [
    {
      path: "*",
      element: <NotFound />,
    },
    {
      path: "/product",
      element: <ProductPage />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/",
      element: (
        <ProtectedRoute
          allowedRoles={[
            "Super Admin",
            "Admin",
            "Worker",
            "Super Member",
            "Member",
          ]}
        >       
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/dashboard",
          element: (
            <ProtectedRoute
              allowedRoles={[
                "Super Admin",
                "Admin",
                "Worker",
                "Super Member",
                "Member",
              ]}
            >
              <Dashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "/inventory",
          element: (
            <ProtectedRoute
              allowedRoles={[
                "Super Admin",
                "Admin",
                "Worker",
                "Super Member",
                "Member",
              ]}
            >
              <Inventory />
            </ProtectedRoute>
          ),
        },
        {
          path: "/client-management",
          element: (
            <ProtectedRoute
              allowedRoles={[
                "Super Admin",
                "Admin",
                "Worker"
              ]}
            >
              <ClientManagement />
            </ProtectedRoute>
          ),
        },
        {
          path: "/Member-management",
          element: (
            <ProtectedRoute
              allowedRoles={["Super Admin", "Admin", "Super Member"]}
            >
              <MemberManagement />
            </ProtectedRoute>
          ),
        },
        {
          path: "/unassigned-work",
          element: (
            <ProtectedRoute allowedRoles={["Super Admin", "Admin", "Worker"]}>
              <UnassignedWork />
            </ProtectedRoute>
          ),
        },
        {
          path: "/report-box",
          element: (
            <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
              <ReportBox />
            </ProtectedRoute>
          ),
        },
        {
          path: "/submitted-work",
          element: (
            <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
              <SubmittedWork />
            </ProtectedRoute>
          ),
        },
        {
          path: "/activity-log",
          element: (
            <ProtectedRoute allowedRoles={["Super Admin", "Admin", "Worker"]}>
              <ActivityLog />
            </ProtectedRoute>
          ),
        },
        {
          path: "/item-log",
          element: (
            <ProtectedRoute allowedRoles={["Super Admin", "Admin","Worker"]}>
              <ItemLog />
            </ProtectedRoute>
          ),
        },
        {
          path: "/setting",
          element: (
            <ProtectedRoute
              allowedRoles={[
                "Super Admin",
                "Admin",
                "Worker",
                "Super Member",
                "Member",
              ]}
            >
              <Setting />
            </ProtectedRoute>
          ),
        },
      ],
    },
  ]
);

const queryParameters = new URLSearchParams(window.location.search);
const id = queryParameters.get("id");

function App() {
  if (id) {
    return (
      <div className="app bg-bg">
        <ProductPage id={id} />
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="app bg-bg">
        <RouterProvider 
          router={router} 
          fallbackElement={<div className="flex justify-center items-center h-screen">Loading...</div>}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
