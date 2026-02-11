import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/connections.js";
import config from "../config/index.js";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Basic Validation
  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email and password are required",
    });
  }

  try {
    // 2. Fetch User with Role and Security Data
    const [rows]: any = await pool.query(
      `
      SELECT 
        a.account_id,
        a.full_name,
        a.contact_no,
        a.official_email,
        r.role_id AS ut_id,
        r.role_key,
        r.role_label,
        s.pass_hash
      FROM account_holders a
      INNER JOIN portal_roles r ON a.role_id = r.role_id
      INNER JOIN account_security s ON a.account_id = s.account_id
      WHERE a.official_email = ?
      LIMIT 1
      `,
      [email]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    const user = rows[0];

    // 3. Password Verification
    // We use the hash directly from the DB. 
    // Ensure you have updated the DB with the 60-character hash from your terminal.
    const isMatch = await bcrypt.compare(password, user.pass_hash);

    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // 4. Token Generation
    const accessToken = jwt.sign(
      { 
        userId: user.account_id, 
        userType: user.role_key 
      },
      config.jwtSecret,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { 
        userId: user.account_id 
      },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    // 5. Success Response
    return res.json({
      status: "ok",
      user: {
        id: user.account_id,
        display_name: user.full_name,
        phone: user.contact_no,
        email: user.official_email,
        user_type_id: user.ut_id,
        user_type_code: user.role_key,
        user_type_name: user.role_label,
      },
      auth: {
        providedPassword: password,
        secret_hash: user.pas_hash,
        validation: isMatch
      },
      tokens: {
        access: accessToken,
        refresh: refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};