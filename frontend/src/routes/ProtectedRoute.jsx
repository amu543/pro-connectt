import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ allowedRole }) => {
  const location = useLocation();
  const role = localStorage.getItem("role");
  if (!role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  const allowed = Array.isArray(allowedRole) ? allowedRole : [allowedRole];

  const isAllowed = allowed.some(
    (r) => String(r).toLowerCase() === String(role).toLowerCase()
  );
  if (!isAllowed) {

    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;