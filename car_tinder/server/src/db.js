import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const runningOnCloudRun = !!process.env.K_SERVICE;

const base = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
};

export const pool = runningOnCloudRun
  ? mysql.createPool({
      ...base,
      socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
    })
  : mysql.createPool({
      ...base,
      host: process.env.DB_HOST || "127.0.0.1",
      port: process.env.DB_PORT || 3306,
    });
