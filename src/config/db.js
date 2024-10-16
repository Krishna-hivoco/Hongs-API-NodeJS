import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const getConnection = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
    port: process.env.DATABASE_PORT || 3306,
  });
  return connection;
};
