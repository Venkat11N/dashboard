import { type Response } from 'express';
import { pool } from '../db/connections.js';


interface AuthRequest {
  user?: {
    userId: number;
    email?: string;
  };
  body: any;
  params: any;
  query: any;
  files?: Express.Multer.File[];
}


const getCategoryName = async (categoryId: number): Promise<string> => {
  try {
    const [rows]: any = await pool.query(
      "SELECT name FROM grievance_categories WHERE category_id = ?",
      [categoryId]
    );
    return rows.length > 0 ? rows[0].name : 'General Grievance';
  } catch (error) {
    return 'General Grievance';
  }
};


export const submitGrievance = async (req: AuthRequest, res: Response) => {
  console.log("=== SUBMIT GRIEVANCE ===");
  console.log("req.files:", req.files);
  console.log("req.file:", (req as any).file);
  console.log("Content-Type:", req.headers['content-type']);
  
  const {
    indos_number,
    first_name,
    last_name,
    category_id,
    subcategory_id,
    description
  } = req.body;

  const account_id = req.user?.userId;

  console.log("User ID:", account_id);
  console.log("Body:", req.body);

  if (!account_id) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  if (!indos_number || !description) {
    return res.status(400).json({ 
      status: "error", 
      message: "INDOS number and description are required" 
    });
  }

  try {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    const reference_number = `GRV-${year}-${timestamp}-${randomStr}`;


    const categoryIdNum = category_id ? parseInt(category_id) : null;
    const categoryName = categoryIdNum ? await getCategoryName(categoryIdNum) : 'General Grievance';
    const subject = categoryName;

    console.log("Reference:", reference_number);
    console.log("Subject (Category):", subject);

    const [result]: any = await pool.query(
      `INSERT INTO grievances (
        reference_number,
        account_id,
        indos_number,
        first_name,
        last_name,
        category_id,
        subcategory_id,
        subject,
        description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reference_number,
        account_id,
        indos_number,
        first_name || null,
        last_name || null,
        categoryIdNum,
        subcategory_id ? parseInt(subcategory_id) : null,
        subject,
        description
      ]
    );

    console.log("✅ Created! ID:", result.insertId);

    res.status(201).json({
      status: "ok",
      message: "Grievance submitted successfully",
      data: {
        grievance_id: result.insertId,
        reference_number: reference_number,
        subject: subject
      }
    });
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error("❌ SQL State:", error.sqlState);
    console.error("❌ SQL:", error.sql);
    
    res.status(500).json({ 
      status: "error", 
      message: "Failed to submit grievance",
      error: error.message
    });
  }
};



export const submitGrievanceWithFiles = async (req: AuthRequest, res: Response) => {
  console.log("=== SUBMIT GRIEVANCE WITH FILES ===");
  
  const files = req.files as Express.Multer.File[];
  
  console.log("Files received:", files?.length || 0);
  console.log("Files array:", files);

  const {
    indos_number,
    first_name,
    last_name,
    category_id,
    subcategory_id,
    description
  } = req.body;

  const account_id = req.user?.userId;

  console.log("User ID:", account_id);
  console.log("Body:", req.body);

  if (!account_id) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  if (!indos_number || !description) {
    return res.status(400).json({ 
      status: "error", 
      message: "INDOS number and description are required" 
    });
  }

  try {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    const reference_number = `GRV-${year}-${timestamp}-${randomStr}`;

    // Get category name for subject
    const categoryIdNum = category_id ? parseInt(category_id) : null;
    let subject = 'General Grievance';
    
    if (categoryIdNum) {
      const [catRows]: any = await pool.query(
        "SELECT name FROM grievance_categories WHERE category_id = ?",
        [categoryIdNum]
      );
      if (catRows.length > 0) {
        subject = catRows[0].name;
      }
    }

    console.log("Reference:", reference_number);
    console.log("Subject:", subject);


    const [result]: any = await pool.query(
      `INSERT INTO grievances (
        reference_number,
        account_id,
        indos_number,
        first_name,
        last_name,
        category_id,
        subcategory_id,
        subject,
        description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reference_number,
        account_id,
        indos_number,
        first_name || null,
        last_name || null,
        categoryIdNum,
        subcategory_id ? parseInt(subcategory_id) : null,
        subject,
        description
      ]
    );

    const grievanceId = result.insertId;
    console.log("✅ Grievance Created! ID:", grievanceId);


    const uploadedFiles: any[] = [];
    
    console.log("📁 Starting file insert... Files count:", files?.length || 0);
    
    if (files && Array.isArray(files) && files.length > 0) {
      for (const file of files) {
        console.log("📄 Inserting file:", file.originalname);
        console.log("   Path:", file.path);
        console.log("   Type:", file.mimetype);
        
        try {
          const [fileResult]: any = await pool.query(
            `INSERT INTO grievance_files (grievance_id, file_path, file_name, file_type)
             VALUES (?, ?, ?, ?)`,
            [grievanceId, file.path, file.originalname, file.mimetype]
          );
          
          console.log("✅ File inserted! ID:", fileResult.insertId);
          
          uploadedFiles.push({
            id: fileResult.insertId,
            file_name: file.originalname,
            file_path: file.path,
            file_type: file.mimetype
          });
        } catch (fileErr: any) {
          console.error("❌ File insert error:", fileErr.message);
        }
      }
    } else {
      console.log("⚠️ No files to insert");
    }

    console.log("✅ Total files saved to DB:", uploadedFiles.length);

    res.status(201).json({
      status: "ok",
      message: "Grievance submitted successfully",
      data: {
        grievance_id: grievanceId,
        reference_number: reference_number,
        subject: subject,
        files_uploaded: uploadedFiles.length,
        files: uploadedFiles
      }
    });
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ 
      status: "error", 
      message: "Failed to submit grievance",
      error: error.message
    });
  }
};

export const getMyGrievances = async (req: AuthRequest, res: Response) => {
  const account_id = req.user?.userId;
  const limit = req.query?.limit ? parseInt(req.query.limit as string) : 10;

  if (!account_id) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  try {
    const [rows]: any = await pool.query(
      `SELECT 
        g.grievance_id AS id,
        g.reference_number,
        g.subject,
        g.status, 
        g.priority, 
        g.created_at,
        c.name AS category_name
      FROM grievances g
      LEFT JOIN grievance_categories c ON g.category_id = c.category_id
      WHERE g.account_id = ? 
      ORDER BY g.created_at DESC
      LIMIT ?`,
      [account_id, limit]
    );

    console.log(`✅ Found ${rows.length} grievances for user ${account_id}`);
    res.json({ status: "ok", data: rows, count: rows.length });
  } catch (error: any) {
    console.error("❌ Error fetching my grievances:", error.message);
    res.status(500).json({ status: "error", message: "Failed to fetch grievances" });
  }
};



export const getGrievanceById = async (req: AuthRequest, res: Response) => {
  const account_id = req.user?.userId;
  const { id } = req.params;

  if (!account_id) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  try {
    const [rows]: any = await pool.query(
      `SELECT 
        g.*,
        c.name AS category_name,
        s.name AS subcategory_name
      FROM grievances g
      LEFT JOIN grievance_categories c ON g.category_id = c.category_id
      LEFT JOIN grievance_subcategories s ON g.subcategory_id = s.subcategory_id
      WHERE g.grievance_id = ? AND g.account_id = ?`,
      [id, account_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Not found" });
    }

    const [files]: any = await pool.query(
      `SELECT * FROM grievance_files WHERE grievance_id = ?`,
      [id]
    );

    res.json({ status: "ok", data: { ...rows[0], files } });
  } catch (error: any) {
    console.error("❌ Error fetching grievance by ID:", error.message);
    res.status(500).json({ status: "error", message: "Failed to fetch grievance" });
  }
};

export const trackGrievance = async (req: AuthRequest, res: Response) => {
  const { reference } = req.params;
  const account_id = req.user?.userId;

  console.log("\n🔍 === DIAGNOSTIC MODE ===");
  
  try {

    const [gCols]: any = await pool.query("SHOW COLUMNS FROM grievances");
    const gColNames = gCols.map((c: any) => c.Field);
    console.log("📊 Grievances Table Columns:", gColNames);


    const [cCols]: any = await pool.query("SHOW COLUMNS FROM grievance_categories");
    const cColNames = cCols.map((c: any) => c.Field);
    console.log("📊 Categories Table Columns:", cColNames);


    const [sCols]: any = await pool.query("SHOW COLUMNS FROM grievance_subcategories");
    const sColNames = sCols.map((c: any) => c.Field);
    console.log("📊 Subcategories Table Columns:", sColNames);


    const catIdCol = cColNames.includes('category_id') ? 'category_id' : 'id';
    const subIdCol = sColNames.includes('subcategory_id') ? 'subcategory_id' : 'id';
    
    console.log(`💡 Detected ID columns: Category=[${catIdCol}], Subcategory=[${subIdCol}]`);

  
    const query = `
      SELECT 
        g.*, 
        c.name AS category_name,
        s.name AS subcategory_name
      FROM grievances g
      LEFT JOIN grievance_categories c ON g.category_id = c.${catIdCol}
      LEFT JOIN grievance_subcategories s ON g.subcategory_id = s.${subIdCol}
      WHERE g.reference_number = ? AND g.account_id = ?
    `;

    console.log("🚀 Executing Dynamic Query...");
    const [rows]: any = await pool.query(query, [reference.trim(), account_id]);

    if (rows.length === 0) {
      console.log("❌ Not Found");
      return res.status(404).json({ status: "error", message: "Grievance not found" });
    }

    console.log("✅ Grievance Found!");

    // 6. Get files (checking columns first to be safe)
    const [fCols]: any = await pool.query("SHOW COLUMNS FROM grievance_files");
    const fColNames = fCols.map((c: any) => c.Field);
    const fileIdCol = fColNames.includes('file_id') ? 'file_id' : 'id';

    const [files]: any = await pool.query(
      `SELECT ${fileIdCol} as id, file_name, file_path, file_type, created_at 
       FROM grievance_files 
       WHERE grievance_id = ?`,
      [rows[0].grievance_id] // Assuming grievance_id exists based on step 1 output
    );

    res.json({
      status: "ok",
      data: { ...rows[0], files }
    });

  } catch (error: any) {
    console.error("💥 CRITICAL DB ERROR:", error.message);
    console.error("   SQL:", error.sql);
    res.status(500).json({ status: "error", message: error.message });
  }
};


export const getGrievanceFiles = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  try {
    const [files]: any = await pool.query(
      "SELECT * FROM grievance_files WHERE grievance_id = ?",
      [id]
    );
    res.json({ status: "ok", data: files });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: "Failed to fetch files" });
  }
};


export const downloadGrievanceFile = async (req: AuthRequest, res: Response) => {
  const { fileId } = req.params;
  
  try {
    const [files]: any = await pool.query(
      "SELECT * FROM grievance_files WHERE id = ?",
      [fileId]
    );

    if (files.length === 0) {
      return res.status(404).json({ status: "error", message: "File not found" });
    }

    res.download(files[0].file_path, files[0].file_name);
  } catch (error: any) {
    res.status(500).json({ status: "error", message: "Failed to download" });
  }
};


export const getAllGrievancesAdmin = async (req: AuthRequest, res: Response) => {
  const status = req.query.status as string;
  
  console.log("\n=== ADMIN FETCH DEBUG ===");
  console.log("Requested Status Filter:", status);
  console.log("Requester User ID:", req.user?.userId);

  try {
    let query = `
      SELECT 
        g.grievance_id,
        g.reference_number,
        g.subject,
        g.status,
        g.created_at,
        a.full_name AS applicant_name
      FROM grievances g
      LEFT JOIN account_holders a ON g.account_id = a.account_id
    `;

    const params: any[] = [];

    if (status && status !== 'ALL' && status !== 'undefined') {
      query += ` WHERE g.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY g.created_at DESC LIMIT 50`;

    console.log("Executing SQL:", query);
    console.log("Params:", params);

    const [rows]: any = await pool.query(query, params);

    console.log("Rows Found:", rows.length);
    if (rows.length > 0) {
      console.log("First Row Sample:", rows[0]);
    }

    res.json({ status: "ok", data: rows });
  } catch (error: any) {
    console.error("❌ Admin API Error:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getGrievanceStats = async (req: AuthRequest, res: Response) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('SUBMITTED', 'IN_PROGRESS') THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved
      FROM grievances
    `);

    res.json({ status: "ok", data: rows[0] });
  } catch (error: any) {
    console.error("Stats Error:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch stats" });
  }
};


export const getGrievanceByIdAdmin = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  console.log("=== ADMIN GET DETAIL ===");
  console.log("ID:", id);

  try {
    const [rows]: any = await pool.query(
      `SELECT
       g.*,
       c.name AS category_name,
       s.name AS subcategory_name,
       a.full_name AS applicant_name,
       a.contact_no AS applicant_phone,
       a.contact_no,
       a.indos_number,
       a.cdc_number
      FROM grievances g
      LEFT JOIN grievance_categories c ON g.category_id = c.category_id
      LEFT JOIN grievance_subcategories s ON g.subcategory_id = s.subcategory_id
      LEFT JOIN account_holders a ON g.account_id = a.account_id
      WHERE g.grievance_id = ?`,
      [id]
    );

    if(rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Grievance not found"})
    }

    const [files]: any = await pool.query(
      `SELECT * FROM grievance_files WHERE grievance_id = ?`,
      [id]
    );

    res.json({
      status: "ok",
      data: {...rows[0], files}
    });
  } catch (error: any) {
    console.error("Admin Detail Error:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch grievance"});
  }
};

export const updateGrievanceStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  const adminId = req.user?.userId;

  if (!status) {
    return res.status(400).json({ status: "error", message: "Status is required"});
  }
  if(!adminId) return res.status(401).json({ status: "error", message: "Unauthorized"});

  const connection = await pool.getConnection();

  try {
    const [current]: any = await connection.query(
      "SELECT status FROM grievances WHERE grievance_id = ?",
      [id]
    );

    if (current.length === 0) {
      await connection.rollback();
      return res.status(404).json({ status: "error", message: "Grievance not found"});
    }

    const previous_status = current[0].status;

    await connection.query(
      "UPDATE grievances SET status = ?, updated_at = NOW() WHERE grievance_id = ?",
      [status, id]
    );

    await connection.query(
      `INSERT INTO grievance_history
      (grievance_id, action_by, previous_status, new_status, remarks)
      VALUES (?,?,?,?,?)`,
      [id, adminId, previous_status, status, remarks || 'Status updated']
    );

    await connection.commit();
    res.json({ status: "ok", message: "Status updated successfully"});
  } catch (error: any) {
    await connection.rollback();
    console.error("Update Error:", error);
    res.status(500).json({ status: "error", message: "Failed to update status"});
  } finally {
    connection.release();
  }
}


  export const getGrievanceHistory = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
      const [row]: any = await pool.query(
        `
        SELECT
        h.history_id,
        h.previous_status,
        h.new_status,
        h.remarks,
        h.created_at,
        a.full_name AS action_by_name,
        r.role_key AS action_by_role
      FROM grievance_history h
      LEFT JOIN account_holders a ON h.action_by = a.account_id
      LEFT JOIN portal_roles r ON a.role_id = r.role_id
      WHERE h.grievance_id = ?
      ORDER BY h.created_at DESC`,
      [id]
    );
    res.json({ status: "ok", data: rows});
  } catch (error: any) {
    console.error("Histroy Fetch Error:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch history"});
  }
};