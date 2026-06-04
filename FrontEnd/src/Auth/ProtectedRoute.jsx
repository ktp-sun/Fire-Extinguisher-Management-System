import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import SweetAlert from "sweetalert2";

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, hasRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated()) {
    // Store the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    SweetAlert.fire({
      icon: "error",
      title: "Access Denied",
      text: "You don't have permission to access this page",
      confirmButtonColor: "#FD6E28",
    });
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}