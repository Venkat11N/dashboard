import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import VerifyOtp from "../pages/auth/VerifyOtp";

import Home from "../pages/dashboard/Home";
import GrievanceDashboard from "../pages/dashboard/Dashboard";
import GrievanceForm from "../components/GrievanceForm";
import RequireOtp from "../pages/auth/RequireOtp";
import SubmissionSuccess from "../components/grievance/SubmissionSuccess";
import AllSubmissions from "../components/dashboard/AllSubmission";
import RequireAuth from "../pages/auth/RequireAuth";

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

        <Route
          path="/dashboard/application-status"
          element={
            <RequireOtp>
              <SubmissionSuccess />
            </RequireOtp>
          }
        />

        <Route 
        path="/dashboard/grievances" 
        element={
        <RequireAuth>
          <AllSubmissions />
          </RequireAuth>
        } 
      />


        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
