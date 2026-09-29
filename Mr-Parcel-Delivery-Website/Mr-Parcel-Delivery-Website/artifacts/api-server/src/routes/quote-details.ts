import { Router, type IRouter } from "express";
import nodemailer from "nodemailer";

const router: IRouter = Router();
const RECIPIENTS = ["lanceh@masakhegroup.co.za", "lance.heyne@gmail.com"];

type ParcelDetails = {
  name: string;
  description: string;
  weightKg: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  quantity: string;
};

function text(value: unknown, maxLength = 500): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password || !Number.isFinite(port) || port <= 0) {
    throw new Error("SMTP is not configured.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
    auth: { user, pass: password },
  });
}

function normalizeParcel(value: unknown, index: number): ParcelDetails {
  const parcel = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    name: text(parcel.name, 80) || `Parcel ${index + 1}`,
    description: text(parcel.description, 240),
    weightKg: text(parcel.weightKg, 30),
    lengthCm: text(parcel.lengthCm, 30),
    widthCm: text(parcel.widthCm, 30),
    heightCm: text(parcel.heightCm, 30),
    quantity: text(parcel.quantity, 30) || "1",
  };
}

router.post("/quote-details", async (req, res, next) => {
  const body = req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {};
  const customerName = text(body.customerName, 120);
  const customerEmail = text(body.customerEmail, 255).toLowerCase();
  const customerPhone = text(body.customerPhone, 60);
  const pickupAddress = text(body.pickupAddress, 500);
  const pickupPostalCode = text(body.pickupPostalCode, 20);
  const pickupDate = text(body.pickupDate, 40);
  const dropoffName = text(body.dropoffName, 120);
  const dropoffAddress = text(body.dropoffAddress, 500);
  const dropoffPostalCode = text(body.dropoffPostalCode, 20);
  const preferredTime = text(body.preferredTime, 120);
  const notes = text(body.notes, 1500);
  const rawParcels = Array.isArray(body.parcels) ? body.parcels.slice(0, 20) : [];
  const parcels = rawParcels.map(normalizeParcel);

  if (!customerName || (!customerEmail && !customerPhone) || !pickupAddress || !dropoffAddress || parcels.length === 0) {
    res.status(400).json({
      error: "Add your name, at least one contact method, both addresses and one parcel.",
    });
    return;
  }

  if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    res.status(400).json({ error: "Enter a valid email address or leave it blank." });
    return;
  }

  try {
    const detailRows = [
      ["Customer", customerName],
      ["Email", customerEmail || "Not provided"],
      ["Phone / WhatsApp", customerPhone || "Not provided"],
      ["Collection address", pickupAddress],
      ["Collection postal code", pickupPostalCode || "Not provided"],
      ["Preferred collection date", pickupDate || "Not specified"],
      ["Delivery recipient", dropoffName || "Not provided"],
      ["Delivery address", dropoffAddress],
      ["Delivery postal code", dropoffPostalCode || "Not provided"],
      ["Preferred delivery time", preferredTime || "Not specified"],
      ["Additional notes", notes || "None"],
    ];
    const parcelLines = parcels.flatMap((parcel, index) => [
      `Parcel ${index + 1}: ${parcel.name}`,
      `  Description: ${parcel.description || "Not provided"}`,
      `  Weight: ${parcel.weightKg || "Not provided"} kg`,
      `  Dimensions: ${parcel.lengthCm || "?"} × ${parcel.widthCm || "?"} × ${parcel.heightCm || "?"} cm`,
      `  Quantity: ${parcel.quantity}`,
    ]);
    const plainText = [
      "New Mr Parcel quote details",
      "",
      ...detailRows.map(([label, value]) => `${label}: ${value}`),
      "",
      "Parcel details",
      ...parcelLines,
      "",
      `Submitted: ${new Date().toISOString()}`,
    ].join("\n");
    const htmlRows = detailRows
      .map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`)
      .join("");
    const htmlParcels = parcels
      .map((parcel, index) => `
        <li>
          <strong>${escapeHtml(`Parcel ${index + 1}: ${parcel.name}`)}</strong><br>
          Description: ${escapeHtml(parcel.description || "Not provided")}<br>
          Weight: ${escapeHtml(parcel.weightKg || "Not provided")} kg<br>
          Dimensions: ${escapeHtml(`${parcel.lengthCm || "?"} × ${parcel.widthCm || "?"} × ${parcel.heightCm || "?"} cm`)}<br>
          Quantity: ${escapeHtml(parcel.quantity)}
        </li>
      `)
      .join("");

    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: RECIPIENTS,
      replyTo: customerEmail || undefined,
      subject: `New Mr Parcel quote details — ${customerName}`,
      text: plainText,
      html: `<h2>New Mr Parcel quote details</h2>${htmlRows}<h3>Parcel details</h3><ol>${htmlParcels}</ol>`,
    });

    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;