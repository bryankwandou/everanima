import { neon } from "@neondatabase/serverless";
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const sql = neon(process.env.DATABASE_URL);

export const FREE_LIMIT = 20;

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(Buffer.from(hash, "hex"), candidate);
}

export async function createSession(userId) {
  const token = randomBytes(32).toString("hex");
  await sql`INSERT INTO sessions (token, user_id) VALUES (${token}, ${userId})`;
  cookies().set("everanima_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
  return token;
}

export async function currentUser() {
  const token = cookies().get("everanima_session")?.value;
  if (!token) return null;
  const rows = await sql`
    SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token} LIMIT 1`;
  return rows[0] || null;
}

export function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    fullName: u.full_name,
    wallet: u.wallet_pubkey,
    tier: u.tier,
    msgCount: u.msg_count,
    freeLimit: FREE_LIMIT
  };
}
