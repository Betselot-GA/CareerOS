import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken } from "../lib/auth";

function ProtectedRoute() {
  if (!getAccessToken()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default ProtectedRoute;
