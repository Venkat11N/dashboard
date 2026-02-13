import { pool } from "../db/connections.js";
import { transporter } from "../config/mailer.js";

export const sendOtpEmail = async (email: string, otp: string) => {
  return transporter.sendMail({
    from: `"Maritime Portal" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your Security Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #1d4ed8;">Security Verification</h2>
        <p>Your 6-digit verification code is:</p>
        <h1 style="background: #f3f4f6; padding: 10px; letter-spacing: 5px; text-align: center;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
};

export const saveOtpToDb = async (email: string, otp: string, expiresAt: Date) => {
  return pool.query(
    `INSERT INTO temp_otps (email, otp_code, expires_at) 
     VALUES (?, ?, ?) 
     ON DUPLICATE KEY UPDATE otp_code = ?, expires_at = ?`,
    [email, otp, expiresAt, otp, expiresAt]
  );
};

export const getFullUserContext = async (email: string) => {
  const [rows]: any = await pool.query(
    `SELECT 
      a.account_id, a.full_name, a.contact_no, a.official_email,
      r.role_id, r.role_key, r.role_label,
      s.pass_hash
    FROM account_holders a
    INNER JOIN portal_roles r ON a.role_id = r.role_id
    INNER JOIN account_security s ON a.account_id = s.account_id
    WHERE a.official_email = ?`, 
    [email]
  );
  return rows[0];
};