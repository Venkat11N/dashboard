import dotenv from 'dotenv';
dotenv.config();

export default {
  server: {
    port: process.env.PORT || 5000,
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'maritime_portal',
    port: Number(process.env.DB_PORT) || 3307,
  },
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_key'
};