import mysql from 'mysql2/promise';
import config from '../config/index.js';

export const pool = mysql.createPool({
  ...config.db,
  waitForConnections: true,
  connectionLimit: 10,
  password: config.db.password || '',
});

export async function DatabaseConnection() {
  const connection = await pool.getConnection();
  console.log('[ db ] successfully connected to MySQL');
  connection.release();
}