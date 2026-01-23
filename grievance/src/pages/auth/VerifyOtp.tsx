import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function verifyOtp() {
    if (!email) {
      setErrorMsg("Session expired. Please log in again.");
      return;
    }
    
    setStatus("idle");
    setErrorMsg("");


    const { error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: 'email', 
    });

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
      return;
    }


    sessionStorage.setItem("otp_verified", "true");
    setStatus("success");
    setTimeout(() => navigate("/dashboard"), 500);
  }

  async function resendOtp() {
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setErrorMsg(error.message);
    } else {
      alert("A new 6-digit code has been sent!");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Security Code</h1>
        <p className="text-sm text-gray-500 mb-6">Sent to {email}</p>

        {errorMsg && <p className="text-xs text-red-500 mb-4">{errorMsg}</p>}

        <div className="space-y-4">
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className={`w-full border-2 p-4 rounded-xl text-center text-2xl font-mono tracking-[0.5em] focus:border-blue-500 outline-none ${
              status === "error" ? "border-red-300 bg-red-50" : "border-gray-100"
            }`}
          />

          <button
            onClick={verifyOtp}
            className={`w-full py-3 rounded-xl text-white font-bold transition-all ${
              status === "success" ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {status === "success" ? "Success!" : "Verify Code"}
          </button>
        </div>

        <button onClick={resendOtp} className="text-sm text-blue-600 mt-6 w-full text-center hover:underline">
          Didn't receive a code? Resend
        </button>
      </div>
    </div>
  );
}