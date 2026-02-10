import { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db/connections.js'; // Ensure this matches your filename exactly
import config from '../config/index.js';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {

    const [rows] = await pool.query(`
      SELECT a.*, r.role_key, r.role_label, s.pass_hash
      FROM account_holders a
      JOIN portal_roles r ON a.role_id = r.role_id
      JOIN account_security s ON a.account_id = s.account_id
      WHERE a.official_email = ?
    `, [email]);


    const userRows = rows as any[];

    if (!userRows || userRows.length === 0) {
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }


    const user = userRows[0];


    const isMatch = await bcrypt.compare(password, user.pass_hash);
    if (!isMatch) {
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }


    const token = jwt.sign(
      { id: user.account_id, role: user.role_key },
      config.jwtSecret,
      { expiresIn: '1d' }
    );


    res.json({
      status: "ok",
      user: {
        id: user.account_id,
        display_name: user.full_name,
        phone: user.contact_no,
        role_key: user.role_key,
        role_name: user.role_label
      },
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};