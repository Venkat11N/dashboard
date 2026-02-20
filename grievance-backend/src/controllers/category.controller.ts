import { type Request, type Response } from "express";
import { pool } from "../db/connections.js";

// Get All Categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {

    const [rows]: any = await pool.query(
      "SELECT category_id AS id, name FROM grievance_categories ORDER BY id ASC"
    );

    return res.json({
      status: "ok",
      data: rows || []
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error while fetching categories"
    });
  }
};

// Get Subcategories
export const getSubcategories = async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  try {
    console.log("Fetching subcategories for Category ID:", categoryId);


    const [rows]: any = await pool.query(
      `SELECT 
        subcategory_id AS id, 
        category_id, 
        name 
       FROM grievance_subcategories 
       WHERE category_id = ? 
       ORDER BY name ASC`,
      [categoryId]
    );

    return res.json({
      status: "ok",
      data: rows 
    });
  } catch (error: any) {
    console.error("SQL Error in getSubcategories:", error.message);
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};