import { Router, type IRouter } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { getDatabasePool, hashPassword } from "../lib/mysql";

const router: IRouter = Router();

router.get("/admin/users", requireAuth, requireRole("admin"), async (_req, res, next) => {
  try {
    const [rows] = await getDatabasePool().execute(
      `SELECT id, email, full_name, created_at
       FROM users
       WHERE role = 'admin' AND is_active = 1
       ORDER BY created_at ASC`,
    );
    res.json({
      users: (rows as Array<Record<string, unknown>>).map((row) => ({
        id: Number(row.id),
        email: String(row.email),
        fullName: String(row.full_name),
        createdAt: new Date(String(row.created_at)).toISOString(),
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/users", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const fullName = typeof req.body?.fullName === "string" ? req.body.fullName.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "Enter a valid email address." });
      return;
    }
    if (fullName.length < 2 || fullName.length > 120) {
      res.status(400).json({ error: "Enter the administrator's full name." });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "The password must be at least 8 characters." });
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

    const [result] = await getDatabasePool().execute(
      "INSERT INTO users (email, full_name, password_hash, role) VALUES (?, ?, ?, 'admin')",
      [email, fullName, await hashPassword(password)],
    );
    res.status(201).json({
      user: {
        id: Number((result as { insertId: number }).insertId),
        email,
        fullName,
        role: "admin",
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;