import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

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

      const { data, error } = await supabase
        .from('temp_otps')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        setErrorMsg("Code not found. Please try logging in again.");
        setStatus("error");
        return;
      }


      if (data.otp_code !== otp) {
        setErrorMsg("Invalid security code. Please check your console.");
        setStatus("error");
        return;
      }


      const isExpired = new Date(data.expires_at) < new Date();
      if (isExpired) {
        setErrorMsg("Code has expired. Please request a new one.");
        setStatus("error");
        return;
      }

      await supabase.from('temp_otps').delete().eq('email', email);
      
      sessionStorage.setItem("otp_verified", "true");
      setStatus("success");
      
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 800);

    } catch (err) {
      setErrorMsg("Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    setLoading(true);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const { error } = await supabase
      .from('temp_otps')
      .upsert({ 
        email, 
        otp_code: newOtp, 
        expires_at: new Date(Date.now() + 10 * 60000).toISOString() 
      });
    
    setLoading(false);
    if (error) {
      setErrorMsg("Failed to resend. Check connection.");
    } else {
      setOtp("");
      setStatus("idle");
      console.log("NEW FREE SECURITY CODE:", newOtp);
      alert("A new code has been generated! Check your console.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-[2rem] shadow-2xl w-[400px] border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
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
            autoComplete="one-time-code"
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









// import { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { supabase } from "../../lib/supabase";

// export default function VerifyOtp() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const email = location.state?.email;

//   const [otp, setOtp] = useState("");
//   const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
//   const [errorMsg, setErrorMsg] = useState("");

//   async function verifyOtp() {
//     if (!email) {
//       setErrorMsg("Session expired. Please log in again.");
//       return;
//     }
    
//     setStatus("idle");
//     setErrorMsg("");


//     const { error } = await supabase.auth.verifyOtp({
//       email: email,
//       token: otp,
//       type: 'email', 
//     });

//     if (error) {
//       setErrorMsg(error.message);
//       setStatus("error");
//       return;
//     }


//     sessionStorage.setItem("otp_verified", "true");
//     setStatus("success");
//     setTimeout(() => navigate("/dashboard"), 500);
//   }

//   async function resendOtp() {
//     if (!email) return;
//     const { error } = await supabase.auth.signInWithOtp({ email });
//     if (error) {
//       setErrorMsg(error.message);
//     } else {
//       alert("A new 6-digit code has been sent!");
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50">
//       <div className="bg-white p-8 rounded-2xl shadow-xl w-96 border border-gray-100">
//         <h1 className="text-2xl font-bold text-gray-900 mb-2">Security Code</h1>
//         <p className="text-sm text-gray-500 mb-6">Sent to {email}</p>

//         {errorMsg && <p className="text-xs text-red-500 mb-4">{errorMsg}</p>}

//         <div className="space-y-4">
//           <input
//             type="text"
//             maxLength={6}
//             placeholder="000000"
//             value={otp}
//             onChange={(e) => setOtp(e.target.value)}
//             className={`w-full border-2 p-4 rounded-xl text-center text-2xl font-mono tracking-[0.5em] focus:border-blue-500 outline-none ${
//               status === "error" ? "border-red-300 bg-red-50" : "border-gray-100"
//             }`}
//           />

//           <button
//             onClick={verifyOtp}
//             className={`w-full py-3 rounded-xl text-white font-bold transition-all ${
//               status === "success" ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
//             }`}
//           >
//             {status === "success" ? "Success!" : "Verify Code"}
//           </button>
//         </div>

//         <button onClick={resendOtp} className="text-sm text-blue-600 mt-6 w-full text-center hover:underline">
//           Didn't receive a code? Resend
//         </button>
//       </div>
//     </div>
//   );
// }