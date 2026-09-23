import { Router, type IRouter } from "express";
import { createSession, deleteSession, getSessionUser, requireAuth, SESSION_COOKIE } from "../middlewares/auth";
import { getDatabasePool, hashPassword, userFromRow, verifyPassword, type AuthUser } from "../lib/mysql";

const router: IRouter = Router();
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  signed: true,
  maxAge: 14 * 24 * 60 * 60 * 1000,
  path: "/",
};

function cleanEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function publicUser(user: AuthUser) {
  return { id: user.id, email: user.email, fullName: user.fullName, role: user.role };
}

router.post("/auth/register", async (req, res, next) => {
  try {
    const email = cleanEmail(req.body?.email);
    const fullName = typeof req.body?.fullName === "string" ? req.body.fullName.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "Enter a valid email address." });
      return;
    }
    if (fullName.length < 2 || fullName.length > 120) {
      res.status(400).json({ error: "Enter your full name." });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "Your password must be at least 8 characters." });
      return;
    }

    const [existing] = await getDatabasePool().execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email],
    );
    if ((existing as Array<unknown>).length > 0) {
      res.status(409).json({ error: "An account with that email already exists." });
      return;
    }
    const passwordHash = await hashPassword(password);
    const [result] = await getDatabasePool().execute(
      "INSERT INTO users (email, full_name, password_hash, role) VALUES (?, ?, ?, 'customer')",
      [email, fullName, passwordHash],
    );
    const userId = Number((result as { insertId: number }).insertId);
    const token = await createSession(userId);
    res.cookie(SESSION_COOKIE, token, cookieOptions);
    res.status(201).json({
      user: { id: userId, email, fullName, role: "customer" },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const email = cleanEmail(req.body?.email);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const [rows] = await getDatabasePool().execute(
      `SELECT id, email, full_name, password_hash, role, is_active
       FROM users WHERE email = ? LIMIT 1`,
      [email],
    );
    const row = (rows as Array<Record<string, unknown>>)[0];
    if (!row || Number(row.is_active) !== 1 || !(await verifyPassword(password, String(row.password_hash)))) {
      res.status(401).json({ error: "Email or password is incorrect." });
      return;
    }
    const user = userFromRow(row as never);
    const token = await createSession(user.id);
    res.cookie(SESSION_COOKIE, token, cookieOptions);
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/auth/logout", async (req, res, next) => {
  try {
    await deleteSession(req.signedCookies?.[SESSION_COOKIE] as string | undefined);
    res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", signed: true, path: "/" });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get("/auth/me", async (req, res, next) => {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.json({ user: null });
      return;
    }
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get("/auth/session", requireAuth, (req, res) => {
  res.json({ user: publicUser(res.locals.user) });
});

export default router;