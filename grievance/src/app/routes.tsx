import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import VerifyOtp from "../pages/auth/VerifyOtp";

import Home from "../pages/dashboard/Home";
import GrievanceDashboard from "../pages/dashboard/Dashboard";
import GrievanceForm from "../components/GrievanceForm";
import RequireOtp from "../pages/auth/RequireOtp";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />


        <Route
          path="/dashboard"
          element={
            <RequireOtp>
              <Home />
            </RequireOtp>
          }
        />


        <Route
          path="/dashboard/grievances"
          element={
            <RequireOtp>
              <GrievanceDashboard />
            </RequireOtp>
          }
        />

        <Route
          path="/dashboard/grievances/new"
          element={
            <RequireOtp>
              <GrievanceForm />
            </RequireOtp>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
