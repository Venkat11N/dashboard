import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import VerifyOtp from "../pages/auth/VerifyOtp";

import Home from "../pages/dashboard/Home";
import GrievanceDashboard from "../pages/dashboard/Dashboard";

import RequireOtp from "../pages/auth/RequireOtp";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Protected – Common Dashboard */}
        <Route
          path="/dashboard"
          element={
            <RequireOtp>
              <Home />
            </RequireOtp>
          }
        />

        {/* Protected – Grievance Module */}
        <Route
          path="/dashboard/grievances"
          element={
            <RequireOtp>
              <GrievanceDashboard />
            </RequireOtp>
          }
        />

        {/* Defaults */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
