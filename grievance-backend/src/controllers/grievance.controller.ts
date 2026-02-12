import { type Response } from 'express';
import { pool } from '../db/connections.js';

export const submitGrievance = async(req: any, res: Response) => {
  const {
    indos_number,
    first_name,
    last_name,
    cdc_number,
    dob,
    category_id,
    subcategory_id,
    subject,
    description,
    priority
  } = req.body;

  const account_id = req.user.userId;

  if (!indos_number || !category_id || !subject || !description) {
    return res.status(400).json({ status: "error", message: "INDOS number, subject and description are required" })
  }

  try {
    const year = new Date().getFullYear();
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const reference_number = `GRV-${year}-${randomStr}`;

    const [result]: any = await pool.query(
      `INSERT INTO grievances (
        reference_number, account_id, indos_number, first_name, last_name,
        cdc_number, dob, category_id, subcategory_id, subject, description, priority                                             
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reference_number, account_id, indos_number, first_name, last_name,
        cdc_number, dob, category_id, subcategory_id, subject, description, priority || 'MEDIUM'
      ]
    );

    res.status(201).json({
      status: "ok",
      message: "Grievance submitted successfully",
      data: {
        grievance_id: result.insertId,
        reference_number: reference_number,
      }
    });
  } catch (error) {
    console.error("Grievance submission error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

export const getMyGrievances = async (req: any, res: Response) => {
  const account_id = req.user.userId;
  try {
    const [rows]: any = await pool.query(
      `
      SELECT
        g.reference_number,
        g.subject,
        g.status,
        g.priority,
        g.created_at,
        c.name AS category_name,
        sc.name AS subcategory_name
      FROM grievances g  -- FIXED: Changed 'grievacne' to 'grievances'
      LEFT JOIN grievance_categories c ON g.category_id = c.category_id
      LEFT JOIN grievance_subcategories sc ON g.subcategory_id = sc.subcategory_id
      WHERE g.account_id = ?
      ORDER BY g.created_at DESC
      `,
      [account_id]
    );

    res.json({
      status: "ok",
      count: rows.length,
      data: rows
    });
  } catch (error) {
    // Logging the actual error will help you see if a column name is wrong
    console.error("Fetch grievances error:", error); 
    res.status(500).json({ status: "error", message: "Could not retrieve grievances" });
  }
};