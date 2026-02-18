import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import VerifyOtp from "../pages/auth/VerifyOtp";
import Home from "../pages/dashboard/Home";
import GrievanceForm from "../pages/dashboard/GrievanceForm";
import RequireOtp from "../pages/auth/RequireOtp";
import SubmissionSuccess from "../components/grievance/SubmissionSuccess";
import AllSubmissions from "../components/dashboard/AllSubmission";
import GrievanceDetail from '../components/grievance/GrievanceDetail';
import TrackStatus from '../pages/dashboard/TrackPages';
import ViewDocuments from '../pages/dashboard/ViewDocuments';
import Profile from '../pages/dashboard/Profile';
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminGrievanceList from "../pages/admin/AdminGrievanceList";


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        <Route
          path="/dashboard"
          element={<RequireOtp><Home /></RequireOtp>}
        />


        <Route
          path="/dashboard/grievances"
          element={<RequireOtp><AllSubmissions /></RequireOtp>}
        />

        <Route
          path="/dashboard/grievances/new"
          element={<RequireOtp><GrievanceForm /></RequireOtp>}
        />

        <Route
          path="/dashboard/application-status"
          element={<RequireOtp><SubmissionSuccess /></RequireOtp>}
        />

        <Route 
          path="/dashboard/grievances/:id" 
          element={<GrievanceDetail />} 
        />


        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard/track" element={<TrackStatus />} />
        <Route path="/dashboard/documents" element={<ViewDocuments />} />
        <Route path="/dashboard/profile" element={<Profile />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/grievances" element={<AdminGrievanceList />} />
      </Routes>
    </BrowserRouter>
  );
}