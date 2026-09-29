import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";
import { scrypt as scryptCallback, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

let pool: Pool | undefined;

export type Role = "customer" | "admin";

export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  role: Role;
};

export type PricingService = {
  id: string;
  name: string;
  description: string;
  deliveryWindow: string;
  basePrice: number;
  perKgPrice: number;
  volumetricDivisor: number;
  popular: boolean;
  enabled: boolean;
};

type UserRow = RowDataPacket & {
  id: number;
  email: string;
  full_name: string;
  password_hash: string;
  role: Role;
  is_active: number;
};

function getPool(): Pool {
  if (pool) return pool;

  const required = ["MYSQL_HOST", "MYSQL_DATABASE", "MYSQL_USER", "MYSQL_PASSWORD"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing MySQL configuration: ${missing.join(", ")}`);
  }

  pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    ssl: String(process.env.MYSQL_SSL || "").toLowerCase() === "true"
      ? { rejectUnauthorized: false }
      : undefined,
    waitForConnections: true,
    connectionLimit: 8,
    enableKeepAlive: true,
  });

  return pool;
}

export async function ensureSchema(): Promise<void> {
  const connection = await getPool().getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        full_name VARCHAR(120) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash CHAR(64) NOT NULL PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT sessions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX sessions_expiry_idx (expires_at)
      ) ENGINE=InnoDB
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pricing_settings (
        id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
        vat_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pricing_services (
        id VARCHAR(40) NOT NULL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255) NOT NULL,
        delivery_window VARCHAR(80) NOT NULL,
        base_price DECIMAL(10,2) NOT NULL,
        per_kg_price DECIMAL(10,2) NOT NULL,
        volumetric_divisor INT UNSIGNED NOT NULL,
        popular TINYINT(1) NOT NULL DEFAULT 0,
        enabled TINYINT(1) NOT NULL DEFAULT 1,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    await connection.query(
      "INSERT IGNORE INTO pricing_settings (id, vat_rate) VALUES (1, 15.00)",
    );
    await connection.query(
      `INSERT IGNORE INTO pricing_services
        (id, name, description, delivery_window, base_price, per_kg_price, volumetric_divisor, popular, enabled)
        VALUES
        ('city', 'City Sprint', 'Fast local delivery for urgent parcels.', 'Same day', 75, 16, 4000, 0, 1),
        ('standard', 'Standard Route', 'Reliable door-to-door delivery across South Africa.', '2–3 business days', 95, 19, 5000, 1, 1),
        ('economy', 'Economy Network', 'The practical choice when time is on your side.', '4–6 business days', 68, 13, 5000, 0, 1),
        ('express', 'Express Air', 'Priority handling for time-sensitive shipments.', 'Next business day', 145, 28, 5000, 0, 1)`,
    );
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      const [adminRows] = await connection.query(
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        [adminEmail],
      );
      if ((adminRows as Array<unknown>).length === 0) {
        await connection.query(
          "INSERT INTO users (email, full_name, password_hash, role) VALUES (?, ?, ?, 'admin')",
          [adminEmail, "Mr Parcel Admin", await hashPassword(adminPassword)],
        );
      } else {
        await connection.query(
          "UPDATE users SET role = 'admin', is_active = 1 WHERE email = ?",
          [adminEmail],
        );
      }
    }
  } finally {
    connection.release();
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, salt, hash] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !hash) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export function getDatabasePool(): Pool {
  return getPool();
}

export function userFromRow(row: UserRow): AuthUser {
  return {
    id: Number(row.id),
    email: row.email,
    fullName: row.full_name,
    role: row.role,
  };
}