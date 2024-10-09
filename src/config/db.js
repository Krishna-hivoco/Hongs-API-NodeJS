// // config/db.js
// import mysql from "mysql2/promise";
// import { config } from "dotenv";

// config();

// const dbConfig = {
//   host: process.env.DATABASE_HOST || "localhost:3306",
//   user: process.env.DATABASE_HOST || "root",
//   port: process.env.DATABASE_PORT || "3306",
//   password: process.env.DATABASE_HOST || "asd@#9118",
//   database: process.env.DATABASE_HOST || "hongs_db",
// };

// export const createConnection = async () => {
//   try {
//     const connection = await mysql.createConnection(dbConfig);
//     console.log("Connected to MySQL successfully");
//     return connection;
//   } catch (error) {
//     console.error("Error connecting to MySQL:", error.message);
//     throw error;
//   }
// };

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const createConnection = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
    port: process.env.DATABASE_PORT || 3306,
  });
  return connection;
};
