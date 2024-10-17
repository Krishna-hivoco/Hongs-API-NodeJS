import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

let pool;

export const initDbConnection = () => {
  pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
    waitForConnections: true,
    connectionLimit: 10, // Set your connection limit here
    queueLimit: 0, // Allow unlimited requests
  });
};

export const getConnection = () => {
  return pool.getConnection();
};
