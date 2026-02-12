// Example Node.js Routes
router.get('/categories', async (req, res) => {
  const [rows] = await pool.query('SELECT category_id as id, name FROM grievance_categories ORDER BY id ASC');
  res.json({ status: 'ok', data: rows });
});

router.get('/subcategories/:categoryId', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT sub_id as id, category_id, name FROM grievance_subcategories WHERE category_id = ? ORDER BY name ASC', 
    [req.params.categoryId]
  );
  res.json({ status: 'ok', data: rows });
});