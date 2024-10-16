import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE,
  port: process.env.DATABASE_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10, // Adjust as per your server's capacity
  queueLimit: 0, // No limit on queued connection requests
});

export const getConnection = async () => {
  const connection = await pool.getConnection();
  return connection;
};
