import { type Request, type Response } from "express";
import { pool } from "../db/connections.js";

interface AuthRequest extends Request {
  user?: {
    userId: number;
    userType?: string;
  };
}

export const getProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  try {
    // ✅ FIXED: Join with portal_roles to get role_key
    const [rows]: any = await pool.query(
      `SELECT 
        a.account_id, 
        a.full_name, 
        a.official_email, 
        a.contact_no, 
        a.indos_number,
        a.cdc_number,
        r.role_key,
        r.role_label
       FROM account_holders a
       LEFT JOIN portal_roles r ON a.role_id = r.role_id
       WHERE a.account_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    const user = rows[0];

    // Split name for frontend convenience
    const nameParts = (user.full_name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    res.json({
      status: "ok",
      user: {
        id: user.account_id,
        first_name: firstName,
        last_name: lastName,
        full_name: user.full_name,
        email: user.official_email,
        phone: user.contact_no,
        role: user.role_key || 'USER', 
        role_label: user.role_label,
        indos_number: user.indos_number || 'N/A',
        cdc_number: user.cdc_number || 'N/A'
      }
    });
  } catch (error: any) {
    console.error("Profile fetch error:", error.message);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};