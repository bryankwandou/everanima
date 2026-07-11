import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

await sql`CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  full_name TEXT,
  pass_hash TEXT,
  wallet_pubkey TEXT UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free',
  msg_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;
await sql`CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;
await sql`CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;
await sql`CREATE TABLE IF NOT EXISTS personas (
  user_id INT PRIMARY KEY REFERENCES users(id),
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;
await sql`CREATE TABLE IF NOT EXISTS anchors (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  sig TEXT UNIQUE NOT NULL,
  hash TEXT,
  kind TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;
const t = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
console.log("tables:", t.map((r) => r.table_name).join(", "));
