import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { generateOtp } from "../../utils/otp";
import { hashValue } from "../../utils/hash";

export default function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email : userId,
      password,
    });

    if(error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    if (data.user) {
      const otp = generateOtp();
      const otpHash = await hashValue(otp);

      await supabase.from("email_otps").insert({
        user_id: data.user.id,
        otp_hash: otpHash,
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
      });

      console.log("OTP (for testing):", otp);
    }

    setLoading(false);
    navigate("/verify-otp");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow w-96"
      >
        <h1 className="text-xl font-semibold mb-4">
          Login
        </h1>

        {error && (
          <p className="text-sm text-red-600 mb-2">{error}</p>
        )}
        
        <input
          type="text"
          placeholder="User ID"
          className="w-full border p-2 rounded mb-3"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded mb-4"
          value={password}
          onChange={(e)=> setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>  
      </form>
    </div>
  );
}