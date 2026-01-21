import { Navigate } from "react-router-dom";


export default function RequireOtp({ children } : {children: JSX.Element}) {
  const verified = sessionStorage.getItem("otp_verified") === "true";

  if (!verified) {
    return <Navigate to="/verify-otp" replace />;
  }
  return children;
}