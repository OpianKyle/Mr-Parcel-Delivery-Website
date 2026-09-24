import { Router, type IRouter } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { getDatabasePool, type PricingService } from "../lib/mysql";

const router: IRouter = Router();

function toService(row: Record<string, unknown>): PricingService {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description),
    deliveryWindow: String(row.delivery_window),
    basePrice: Number(row.base_price),
    perKgPrice: Number(row.per_kg_price),
    volumetricDivisor: Number(row.volumetric_divisor),
    popular: Number(row.popular) === 1,
    enabled: Number(row.enabled) === 1,
  };
}

router.get("/pricing", async (_req, res, next) => {
  try {
    const [settingsRows] = await getDatabasePool().execute(
      "SELECT vat_rate FROM pricing_settings WHERE id = 1 LIMIT 1",
    );
    const [serviceRows] = await getDatabasePool().execute(
      `SELECT id, name, description, delivery_window, base_price, per_kg_price,
              volumetric_divisor, popular, enabled
       FROM pricing_services ORDER BY FIELD(id, 'city', 'standard', 'economy', 'express'), name`,
    );
    const settings = (settingsRows as Array<Record<string, unknown>>)[0];
    res.json({
      vatRate: Number(settings?.vat_rate ?? 15),
      services: (serviceRows as Array<Record<string, unknown>>).map(toService),
    });
  } catch (error) {
    next(error);
  }
});

router.put("/pricing", requireAuth, requireRole("admin"), async (req, res, next) => {
  const connection = await getDatabasePool().getConnection();
  try {
    const vatRate = Number(req.body?.vatRate);
    const services = req.body?.services as Array<Record<string, unknown>>;
    if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 100 || !Array.isArray(services) || services.length === 0) {
      res.status(400).json({ error: "Provide a valid VAT rate and at least one service." });
      return;
    }
    await connection.beginTransaction();
    await connection.execute("UPDATE pricing_settings SET vat_rate = ? WHERE id = 1", [vatRate]);
    for (const service of services) {
      const id = String(service.id || "");
      if (!/^[a-z0-9-]{1,40}$/.test(id)) throw new Error("Invalid service id.");
      await connection.execute(
        `UPDATE pricing_services
         SET name = ?, description = ?, delivery_window = ?, base_price = ?,
             per_kg_price = ?, volumetric_divisor = ?, popular = ?, enabled = ?
         WHERE id = ?`,
        [
          String(service.name || "").slice(0, 100),
          String(service.description || "").slice(0, 255),
          String(service.deliveryWindow || "").slice(0, 80),
          Number(service.basePrice),
          Number(service.perKgPrice),
          Number(service.volumetricDivisor),
          Boolean(service.popular),
          Boolean(service.enabled),
          id,
        ],
      );
    }
    await connection.commit();
    res.json({ ok: true });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

export default router;