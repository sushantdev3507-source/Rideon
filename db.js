import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

export const SIGNUP_BONUS = 500;
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
export const sql = url ? neon(url) : null;

let ready = null;
// Creates the tables automatically the first time the API is used.
export function ensureSchema() {
  if (!ready) ready = (async () => {
    await sql`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(150) NOT NULL UNIQUE,
      password_hash VARCHAR(64) NOT NULL, created_at TIMESTAMP DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS wallets (
      user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      balance NUMERIC(10,2) NOT NULL DEFAULT 0)`;
    await sql`CREATE TABLE IF NOT EXISTS wallet_transactions (
      id SERIAL PRIMARY KEY, user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount NUMERIC(10,2) NOT NULL, type VARCHAR(10) NOT NULL, note VARCHAR(200),
      created_at TIMESTAMP DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS rides (
      id SERIAL PRIMARY KEY, user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL, detail VARCHAR(200), fare NUMERIC(10,2) NOT NULL,
      status VARCHAR(10) NOT NULL DEFAULT 'Confirmed', created_at TIMESTAMP DEFAULT NOW())`;
  })().catch((e) => { ready = null; throw e; });
  return ready;
}

export class ApiError extends Error {}

export const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");

export function need(body, key) {
  const v = body?.[key];
  if (v === undefined || v === null || String(v).trim() === "") throw new ApiError("Missing " + key);
  return String(v).trim();
}

export async function balance(userId) {
  const r = await sql`SELECT balance FROM wallets WHERE user_id = ${userId}`;
  return r.length ? Number(r[0].balance) : 0;
}

// Wraps every API endpoint: POST only, JSON in/out, friendly errors.
export function handler(fn) {
  return async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
    if (!sql) return res.status(500).json({ error: "Database not connected. Add DATABASE_URL in Vercel." });
    try {
      await ensureSchema();
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      res.status(200).json(await fn(body));
    } catch (e) {
      if (e instanceof ApiError) return res.status(400).json({ error: e.message });
      console.error(e);
      res.status(500).json({ error: "Server error" });
    }
  };
}
