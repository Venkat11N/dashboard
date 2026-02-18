import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { pool } from "../db/connections.js";
import { sendOtpEmail, saveOtpToDb, getFullUserContext } from "../services/auth.service.js";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: "error", message: "Email and password required" });
  }

  try {
    const [rows]: any = await pool.query(
      `SELECT a.account_id, s.pass_hash 
       FROM account_holders a 
       INNER JOIN account_security s ON a.account_id = s.account_id 
       WHERE a.official_email = ? LIMIT 1`,
      [email]
    );

    if (!rows || rows.length === 0 || !(await bcrypt.compare(password, rows[0].pass_hash))) {
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000);

    await saveOtpToDb(email, otp, expiresAt);
    await sendOtpEmail(email, otp);

    return res.json({ status: "ok", message: "Credentials verified. OTP sent." });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp_code } = req.body;

  console.log("=== VERIFY OTP DEBUG ===");
  console.log("Email:", email);
  console.log("OTP Code:", otp_code);

  if (!email || !otp_code) {
    return res.status(400).json({ status: "error", message: "Email and OTP are required" });
  }

  try {

    console.log("Step 1: Checking OTP in database...");

    const [otpCheck]: any = await pool.query(
      "SELECT email, otp_code, expires_at FROM temp_otps WHERE email = ? AND otp_code = ? AND expires_at > NOW() LIMIT 1",
      [email, otp_code]
    );
    console.log("OTP Query Result:", otpCheck);

    if (!otpCheck || otpCheck.length === 0) {
      return res.status(401).json({ status: "error", message: "Invalid or expired OTP" });
    }


    console.log("Step 2: Getting user context...");
    const user = await getFullUserContext(email);
    console.log("User Context:", user);

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }


    console.log("Step 3: Generating tokens...");
    console.log("JWT Secret exists:", !!config.jwtSecret);

    const accessToken = jwt.sign(
      { userId: user.account_id, userType: user.role_key },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { userId: user.account_id, tokenType: "refresh" },
      config.jwtSecret,
      { expiresIn: "7d" }
    );


    console.log("Step 4: Deleting used OTP...");
    await pool.query("DELETE FROM temp_otps WHERE email = ?", [email]);


    console.log("Step 5: Storing refresh token...");
    await pool.query(
      "INSERT INTO refresh_tokens (account_id, token, expires_at) VALUES (?, ?, ?)",
      [user.account_id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    console.log("=== VERIFY OTP SUCCESS ===");

    return res.json({
      status: "ok",
      user: {
        id: user.account_id,
        display_name: user.full_name,
        phone: user.contact_no,
        email: user.official_email,
        user_type_id: user.role_id,
        user_type_code: user.role_key,
        user_type_name: user.role_label,
      },
      tokens: {
        access: accessToken,
        refresh: refreshToken,
      },
    });
  } catch (error: any) {

    console.error("=== VERIFY OTP ERROR ===");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
    return res.status(500).json({ status: "error", message: "Verification failed" });
  }
};



export const resendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ status: "error", message: "Email is required" });
  }

  try {

    const [rows]: any = await pool.query(
      "SELECT account_id FROM account_holders WHERE official_email = ? LIMIT 1",
      [email]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }


    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 mins expiry


    await saveOtpToDb(email, otp, expiresAt);


    await sendOtpEmail(email, otp);

    return res.json({ status: "ok", message: "New OTP sent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ status: "error", message: "Failed to resend OTP" });
  }
};


export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body || {};
  const cookieToken = req.cookies?.refreshToken;
  const token = refreshToken || cookieToken;

  if (!token) {
    return res.status(401).json({ status: "error", message: "Refresh token required" });
  }

  try {

    const decoded: any = jwt.verify(token, config.jwtRefreshSecret || config.jwtSecret);


    const [rows]: any = await pool.query(
      "SELECT * FROM refresh_tokens WHERE account_id = ? AND token = ? AND expires_at > NOW()",
      [decoded.userId, token]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ status: "error", message: "Invalid refresh token" });
    }


    const [userRows]: any = await pool.query(
      "SELECT account_id, role_key FROM account_holders WHERE account_id = ?",
      [decoded.userId]
    );

    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }


    const newAccessToken = jwt.sign(
      { userId: userRows[0].account_id, userType: userRows[0].role_key },
      config.jwtSecret,
      { expiresIn: "15m" }
    );

    return res.json({
      status: "ok",
      tokens: {
        access: newAccessToken,
      },
    });
  } catch (error) {
    return res.status(401).json({ status: "error", message: "Invalid or expired refresh token" });
  }
};