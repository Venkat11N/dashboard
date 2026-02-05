import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function RequireOtp({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });


    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div>Verifying Security Session...</div>;


  const isOtpVerified = sessionStorage.getItem("otp_verified") === "true";


  if (!session || !isOtpVerified) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}