import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const ssl = process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl,
});

export async function testDbConnection(): Promise<void> {
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT now() AS server_time;");
    console.log("DB OK:", result.rows[0]);
  } finally {
    client.release();
  }
}
