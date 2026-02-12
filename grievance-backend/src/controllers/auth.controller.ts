import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { pool } from "../db/connections.js";
import config from "../config/index.js";

// 1. Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Use App Password if using Gmail
  },
});

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: "error", message: "Email and password are required" });
  }

  try {
    const [rows]: any = await pool.query(
      `SELECT a.account_id, a.official_email, s.pass_hash
       FROM account_holders a
       INNER JOIN account_security s ON a.account_id = s.account_id
       WHERE a.official_email = ? LIMIT 1`,
      [email]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.pass_hash);

    if (!isMatch) {
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    // 3. Store OTP in database (using temp_otps table)
    await pool.query(
      `INSERT INTO temp_otps (email, otp_code, expires_at) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE otp_code = ?, expires_at = ?`,
      [email, otp, expiresAt, otp, expiresAt]
    );

    // 4. Send Email via SMTP
    await transporter.sendMail({
      from: `"Maritime Portal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Security Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1d4ed8;">Security Verification</h2>
          <p>You requested to sign in to the Maritime Portal.</p>
          <p>Your 6-digit verification code is:</p>
          <h1 style="background: #f3f4f6; padding: 10px; letter-spacing: 5px; text-align: center; color: #111;">${otp}</h1>
          <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    // We do not send tokens yet. We redirect user to OTP screen.
    return res.json({
      status: "ok",
      message: "Credentials verified. OTP sent to email.",
    });

  } catch (error) {
    console.error("Login/SMTP Error:", error);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

/**
 * NEW: Verify OTP and issue JWT tokens
 */
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp_code } = req.body;

  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM temp_otps WHERE email = ? AND otp_code = ? AND expires_at > NOW()",
      [email, otp_code]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ status: "error", message: "Invalid or expired OTP" });
    }

    // OTP is valid. Now get user details to sign the JWT.
    const [userRows]: any = await pool.query(
      `SELECT a.account_id, r.role_key 
       FROM account_holders a 
       INNER JOIN portal_roles r ON a.role_id = r.role_id 
       WHERE a.official_email = ?`,
      [email]
    );

    const user = userRows[0];

    const accessToken = jwt.sign(
      { userId: user.account_id, userType: user.role_key },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    // Clean up used OTP
    await pool.query("DELETE FROM temp_otps WHERE email = ?", [email]);

    return res.json({
      status: "ok",
      tokens: { access: accessToken }
    });

  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({ status: "error", message: "Verification failed" });
  }
};