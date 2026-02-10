import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useGovernance } from "../../core/GovernanceContext";



export default function RequireOtp({ children }: { children: JSX.Element }) {
  const { user, loading: governanceLoading } = useGovernance();
  const [authLoading, setAuthLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    // 1. Get initial session
    async function checkSession() {
      const { data: {session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setAuthLoading(false);
    }
    checkSession();
  

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentsession) => {
      setSession(currentsession);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading || governanceLoading) {
    return( 
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verifing Session...</p>
        </div>
      </div>
    );
  }


  const isOtpVerified = sessionStorage.getItem("otp_verified") === "true";

  console.log("Auth Guard Check:", {
    hasSession: !!session,
    isOtpVerified,
    hasUser: !!user,
    path: location.pathname
  });


  if (!session || !isOtpVerified || !user) {
    console.log("Redirecting to login: ", {session: !session, otp: isOtpVerified, user: !!user});
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) return null;

  return children;
}