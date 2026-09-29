import type { NextFunction, Request, Response } from "express";
import { createHash, randomBytes } from "node:crypto";
import { getDatabasePool, userFromRow, type AuthUser, type Role } from "../lib/mysql";

export const SESSION_COOKIE = "mp_session";
const SESSION_DAYS = 14;

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await getDatabasePool().execute(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
    [tokenHash(token), userId, expiresAt],
  );
  return token;
}

export async function deleteSession(token: string | undefined): Promise<void> {
  if (!token) return;
  await getDatabasePool().execute("DELETE FROM sessions WHERE token_hash = ?", [tokenHash(token)]);
}

export async function getSessionUser(req: Request): Promise<AuthUser | null> {
  const token = req.signedCookies?.[SESSION_COOKIE] as string | undefined;
  if (!token) return null;

  const [rows] = await getDatabasePool().execute(
    `SELECT u.id, u.email, u.full_name, u.role, u.is_active
     FROM sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > NOW() AND u.is_active = 1
     LIMIT 1`,
    [tokenHash(token)],
  );
  const row = (rows as Array<Record<string, unknown>>)[0];
  return row ? userFromRow(row as never) : null;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }
    res.locals.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = res.locals.user as AuthUser | undefined;
    if (!user || user.role !== role) {
      res.status(403).json({ error: "You do not have access to this section." });
      return;
    }
    next();
  };
}