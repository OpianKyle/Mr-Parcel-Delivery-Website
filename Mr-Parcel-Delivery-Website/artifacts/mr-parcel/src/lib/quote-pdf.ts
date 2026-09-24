import { jsPDF } from "jspdf";

type PdfQuoteLine = {
  name: string;
  description: string;
  quantity: number;
  chargeableWeightKg: number;
  subtotalExVat: number;
};

export type PdfQuoteData = {
  customerName: string;
  originAddress: string;
  originPostalCode: string;
  destinationCustomerName: string;
  destinationAddress: string;
  destinationPostalCode: string;
  vatRate: number;
  quoteReference: string;
  service: {
    name: string;
    description: string;
    deliveryWindow: string;
  };
  lines: PdfQuoteLine[];
  totalParcels: number;
  chargeableWeightKg: number;
  subtotalExVat: number;
  vatAmount: number;
  totalIncVat: number;
};

const colors = {
  navy: [8, 38, 61] as const,
  blue: [15, 91, 131] as const,
  orange: [243, 111, 33] as const,
  paleOrange: [255, 247, 240] as const,
  paleGreen: [233, 244, 240] as const,
  text: [8, 38, 61] as const,
  muted: [82, 112, 128] as const,
  border: [215, 224, 220] as const,
  white: [255, 250, 241] as const,
};

const money = (value: number) => `R${value.toFixed(2)}`;
const displayValue = (value: string) => value.trim() || "Not provided";

function addPageIfNeeded(document: jsPDF, y: number, requiredHeight = 12) {
  if (y + requiredHeight <= 276) return y;
  document.addPage();
  return 18;
}

function wrappedText(document: jsPDF, value: string, x: number, y: number, width: number, lineHeight = 5) {
  const lines = document.splitTextToSize(value, width) as string[];
  document.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function sectionHeading(document: jsPDF, label: string, y: number) {
  document.setFont("helvetica", "bold");
  document.setFontSize(8);
  document.setTextColor(...colors.orange);
  document.text(label.toUpperCase(), 16, y);
  document.setDrawColor(...colors.border);
  document.line(16, y + 3, 194, y + 3);
  return y + 11;
}

function safeFilePart(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 36) || "customer";
}

export function downloadQuotePdf(data: PdfQuoteData) {
  const document = new jsPDF({ unit: "mm", format: "a4" });
  const generatedDate = new Date();
  const dateLabel = generatedDate.toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });

  document.setFillColor(...colors.navy);
  document.rect(0, 0, 210, 43, "F");
  document.setFillColor(...colors.orange);
  document.rect(0, 40, 210, 3, "F");
  document.setTextColor(...colors.white);
  document.setFont("helvetica", "bold");
  document.setFontSize(22);
  document.text("MR PARCEL", 16, 19);
  document.setFont("helvetica", "normal");
  document.setFontSize(9);
  document.setTextColor(216, 238, 234);
  document.text("Local delivery. Clear quotes. Careful handovers.", 16, 27);
  document.setFont("helvetica", "bold");
  document.setFontSize(8);
  document.setTextColor(...colors.orange);
  document.text("DELIVERY QUOTE", 194, 16, { align: "right" });
  document.setFont("helvetica", "normal");
  document.setTextColor(...colors.white);
  document.text(data.quoteReference, 194, 23, { align: "right" });
  document.text(dateLabel, 194, 30, { align: "right" });

  let y = sectionHeading(document, "Quote details", 57);
  document.setFillColor(...colors.paleGreen);
  document.roundedRect(16, y - 4, 178, 32, 3, 3, "F");
  document.setFont("helvetica", "bold");
  document.setFontSize(9);
  document.setTextColor(...colors.text);
  document.text("Customer", 22, y + 4);
  document.text("Service", 110, y + 4);
  document.setFont("helvetica", "normal");
  document.setTextColor(...colors.muted);
  wrappedText(document, displayValue(data.customerName), 22, y + 10, 76);
  wrappedText(document, data.service.name, 110, y + 10, 76);
  document.setFontSize(8);
  document.text(data.service.deliveryWindow, 110, y + 20);
  document.text(`Prepared ${dateLabel}`, 22, y + 20);
  y += 42;

  y = sectionHeading(document, "Collection and delivery", y);
  document.setFillColor(...colors.paleOrange);
  document.roundedRect(16, y - 4, 178, 38, 3, 3, "F");
  document.setFont("helvetica", "bold");
  document.setFontSize(9);
  document.setTextColor(...colors.text);
  document.text("Collection", 22, y + 4);
  document.text("Delivery", 110, y + 4);
  document.setFont("helvetica", "normal");
  document.setFontSize(8);
  document.setTextColor(...colors.muted);
  y = Math.max(
    wrappedText(document, `${displayValue(data.originAddress)}\n${displayValue(data.originPostalCode)}`, 22, y + 11, 76, 4.5),
    wrappedText(document, `${displayValue(data.destinationAddress)}\n${displayValue(data.destinationPostalCode)}`, 110, y + 11, 76, 4.5),
  );
  document.setFont("helvetica", "bold");
  document.setTextColor(...colors.text);
  document.text("Recipient", 110, y + 4);
  document.setFont("helvetica", "normal");
  document.setTextColor(...colors.muted);
  document.text(displayValue(data.destinationCustomerName), 110, y + 10);
  y += 25;

  y = sectionHeading(document, "Parcel breakdown", y);
  document.setFillColor(...colors.navy);
  document.roundedRect(16, y - 5, 178, 9, 2, 2, "F");
  document.setFont("helvetica", "bold");
  document.setFontSize(7.5);
  document.setTextColor(...colors.white);
  document.text("PARCEL", 21, y + 1);
  document.text("QTY", 104, y + 1);
  document.text("BILLABLE / UNIT", 122, y + 1);
  document.text("EX VAT", 190, y + 1, { align: "right" });
  y += 10;

  data.lines.forEach((line, index) => {
    const description = line.description.trim() ? `${line.name} · ${line.description}` : line.name;
    const descriptionLines = document.splitTextToSize(description, 76) as string[];
    const rowHeight = Math.max(10, descriptionLines.length * 4.5 + 5);
    y = addPageIfNeeded(document, y, rowHeight + 2);
    if (index % 2 === 0) {
      document.setFillColor(248, 251, 249);
      document.rect(16, y - 5, 178, rowHeight, "F");
    }
    document.setFont("helvetica", "normal");
    document.setFontSize(8);
    document.setTextColor(...colors.text);
    document.text(descriptionLines, 21, y + 1);
    document.setTextColor(...colors.muted);
    document.text(String(line.quantity), 104, y + 1);
    document.text(`${line.chargeableWeightKg.toFixed(1)} kg`, 122, y + 1);
    document.setTextColor(...colors.text);
    document.text(money(line.subtotalExVat), 190, y + 1, { align: "right" });
    y += rowHeight;
  });

  y = addPageIfNeeded(document, y, 55);
  document.setDrawColor(...colors.border);
  document.line(108, y, 194, y);
  y += 8;
  document.setFont("helvetica", "normal");
  document.setFontSize(9);
  document.setTextColor(...colors.muted);
  document.text(`${data.totalParcels} parcel${data.totalParcels === 1 ? "" : "s"} · ${data.chargeableWeightKg.toFixed(1)} kg billable`, 16, y);
  document.text("Subtotal ex VAT", 135, y);
  document.setTextColor(...colors.text);
  document.text(money(data.subtotalExVat), 190, y, { align: "right" });
  y += 7;
  document.setTextColor(...colors.muted);
  document.text(`VAT (${data.vatRate}%)`, 135, y);
  document.setTextColor(...colors.text);
  document.text(money(data.vatAmount), 190, y, { align: "right" });
  y += 8;
  document.setFillColor(...colors.navy);
  document.roundedRect(108, y - 5, 86, 17, 3, 3, "F");
  document.setFont("helvetica", "bold");
  document.setFontSize(9);
  document.setTextColor(...colors.orange);
  document.text("TOTAL INCL. VAT", 114, y + 2);
  document.setFontSize(13);
  document.text(money(data.totalIncVat), 190, y + 3, { align: "right" });
  y += 26;

  y = addPageIfNeeded(document, y, 25);
  document.setFont("helvetica", "bold");
  document.setFontSize(8);
  document.setTextColor(...colors.orange);
  document.text("SERVICE NOTE", 16, y);
  document.setFont("helvetica", "normal");
  document.setFontSize(8);
  document.setTextColor(...colors.muted);
  wrappedText(document, `${data.service.description} Quotes are indicative and may change after final parcel verification.`, 16, y + 6, 178, 4.5);

  const pageCount = document.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    document.setPage(page);
    document.setDrawColor(...colors.border);
    document.line(16, 285, 194, 285);
    document.setFont("helvetica", "normal");
    document.setFontSize(7);
    document.setTextColor(...colors.muted);
    document.text("Mr Parcel · West Coast & Cape Town · WhatsApp 078 830 9300", 16, 290);
    document.text(`${page} / ${pageCount}`, 194, 290, { align: "right" });
  }

  const datePart = generatedDate.toISOString().slice(0, 10);
  document.save(`mr-parcel-quote-${safeFilePart(data.customerName)}-${datePart}.pdf`);
}