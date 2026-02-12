import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGovernance } from "../../core/GovernanceContext";

export default function RequireOtp({ children }: { children: JSX.Element }) {
  const { user, loading: governanceLoading } = useGovernance();
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {

    const token = localStorage.getItem('accessToken');
    
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    
    setAuthLoading(false);
  }, []);


  if (authLoading || governanceLoading) {
    return ( 
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verifying Session...</p>
        </div>
      </div>
    );
  }


  const isOtpVerified = sessionStorage.getItem("otp_verified") === "true";

  console.log("Auth Guard Check:", {
    isAuthenticated,
    isOtpVerified,
    hasUser: !!user,
    path: location.pathname
  });


  if (!isAuthenticated || !isOtpVerified || !user) {
    console.log("Redirecting to login: Access Denied");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}