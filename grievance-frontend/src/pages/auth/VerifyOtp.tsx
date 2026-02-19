import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../../config/api"; 
import { useGovernance } from "../../core/GovernanceContext";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  

  const { setUserFromLogin } = useGovernance();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function verifyOtp() {
    if (!email) {
      setErrorMsg("Session expired. Please log in again.");
      return;
    }
    
    if (otp.length < 6) {
      setErrorMsg("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otp }),
      });

      const result = await response.json();

      if (result.status === 'ok') {

        localStorage.setItem('token', result.tokens.access);
        localStorage.setItem('accessToken', result.tokens.access);
        localStorage.setItem('refreshToken', result.tokens.refresh);
        

        sessionStorage.setItem("otp_verified", "true");
        

        if (result.user) {
          setUserFromLogin(result.user);
        console.log("LOGIN SUCCESS:", result);
        console.log("User Type Code:", result.user.user_type_code);
        console.log("Role Key:", result.user.role_key);

        const role = result.user.user_type_code || result.user.role_key;
        console.log("Detected Role:", role);

        if (role === 'ADMIN') {
             console.log("Attempting navigate to ADMIN");
             navigate("/admin/dashboard", { replace: true });
        } else {
             console.log("Attempting navigate to USER");
             navigate("/dashboard", { replace: true });
        }
        }

        setStatus("success");
        

        setTimeout(() => {

          const role = result.user.user_type_code || result.user.role_key;
          
          if (role === 'ADMIN') {
            console.log("Redirecting to Admin Dashboard");
            navigate("/admin/dashboard", { replace: true });
          } else {
            console.log("Redirecting to User Dashboard");
            navigate("/dashboard", { replace: true });
          }
        }, 800);

      } else {
        setErrorMsg(result.message || "Invalid or expired code.");
        setStatus("error");
      }
    } catch (err) {
      setErrorMsg("Verification failed. Check your connection.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    if (!email) return;
    setLoading(true);
    setErrorMsg("");

    try {

      const response = await fetch(`${API_BASE_URL}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.status === 'ok') {
        setOtp("");
        setStatus("idle");
        alert("A new security code has been sent!");
      } else {
        setErrorMsg(result.message || "Failed to resend code.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-[2rem] shadow-2xl w-[400px] border border-gray-100">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Security Code</h1>
        <p className="text-sm text-slate-500 mb-8 font-medium">
          Verifying access for <span className="text-blue-600 font-bold">{email}</span>
        </p>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold mb-6 border border-red-100">
            {errorMsg}
          </div>
        )}

        <div className="space-y-6">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            disabled={loading || status === "success"}
            className={`w-full border-2 p-5 rounded-2xl text-center text-3xl font-mono tracking-[0.4em] transition-all outline-none ${
              status === "error" 
                ? "border-red-300 bg-red-50 text-red-600" 
                : "border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white"
            } ${status === "success" ? "border-green-500 bg-green-50 text-green-600" : ""}`}
          />

          <button
            onClick={verifyOtp}
            disabled={loading || status === "success"}
            className={`w-full py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg ${
              status === "success" 
                ? "bg-green-600 shadow-green-200" 
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
            } disabled:opacity-50`}
          >
            {loading ? "Verifying..." : status === "success" ? "Access Granted" : "Confirm Code"}
          </button>
        </div>

        <button 
          onClick={resendOtp} 
          disabled={loading || status === "success"}
          className="text-xs font-bold text-slate-400 mt-8 w-full text-center hover:text-blue-600 transition-colors uppercase tracking-widest"
        >
          Resend New Code
        </button>
      </div>
    </div>
  );
}