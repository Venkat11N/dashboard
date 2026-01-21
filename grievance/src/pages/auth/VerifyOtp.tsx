import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { generateOtp } from "../../utils/otp";
import { hashValue } from "../../utils/hash";


export default function VerifyOtp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

async function verifyOtp() {
  setStatus("idle");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setStatus("error");
    return;
  }

  const otpHash = await hashValue(otp);

  const { data, error } = await supabase
    .from("email_otps")
    .select("*")
    .eq("user_id", user.id)
    .eq("otp_hash", otpHash)
    .eq("is_used", false)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !data) {
    setStatus("error");
    return;
  }

  await supabase
    .from("email_otps")
    .update({ is_used: true })
    .eq("id", data.id);

  sessionStorage.setItem("otp_verified", "true");

  setStatus("success");

  setTimeout(() => {
    navigate("/dashboard"); // COMMON HOME
  }, 600);
}


async function resendOtp() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const otp = generateOtp();
  const otpHash = await hashValue(otp);

  await supabase.from("email_otps").insert({
    user_id: user.id,
    otp_hash: otpHash,
    expires_at: new Date(Date.now() + 5 * 60 * 1000),
  });

  console.log("Resent OTP:", otp);
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-96">
        <h1 className="text-xl font-semibold mb-4">
          OTP Verification
        </h1>

        <p className="text-sm text-gray-600 mb-3">
          Enter the OTP sent to your registered email
        </p>

        <div className="flex gap-2">

          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className={`flex-1 border p-2 rounded
              ${
                status === "error"
                  ? "border-red-500"
                  : status === "success"
                  ? "border-green-500"
                  : ""
              }`}
          />

          <button
            onClick={verifyOtp}
            className={`px-4 rounded text-white
              ${
                status === "success"
                  ? "bg-green-600"
                  : "bg-blue-600"
              }`}
          >
            Verify
          </button>
        </div>

        <button onClick={resendOtp} className="text-sm text-blue-600 mt-3">
          Resend OTP
        </button>
      </div>
    </div>
  );
}
