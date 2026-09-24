import { useEffect, useState, type ChangeEvent } from "react";
import { ArrowRight, Check, CircleHelp, FileText, Gauge, Info, Package, Plus, Printer, Trash2, Truck, X } from "lucide-react";

export type Service = {
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

export type PricingResponse = { vatRate: number; services: Service[] };
type Parcel = { id: string; name: string; description: string; weightKg: string; lengthCm: string; widthCm: string; heightCm: string; quantity: string };
type FormState = { customerName: string; originAddress: string; originPostalCode: string; destinationCustomerName: string; destinationAddress: string; destinationPostalCode: string; selectedService: string };
type QuoteLine = { name: string; description: string; quantity: number; actualWeightKg: number; volumetricWeightKg: number; chargeableWeightKg: number; subtotalExVat: number };
type Quote = { service: Service; lines: QuoteLine[]; totalParcels: number; chargeableWeightKg: number; subtotalExVat: number; vatAmount: number; totalIncVat: number };

const initialForm: FormState = { customerName: "", originAddress: "", originPostalCode: "", destinationCustomerName: "", destinationAddress: "", destinationPostalCode: "", selectedService: "all" };
const money = (value: number) => `R${value.toFixed(2)}`;
const newParcel = (index: number): Parcel => ({ id: `parcel-${Date.now()}-${index}`, name: `Parcel ${String(index).padStart(2, "0")}`, description: "", weightKg: "", lengthCm: "", widthCm: "", heightCm: "", quantity: "1" });

async function getPricing(): Promise<PricingResponse> {
  const response = await fetch("/api/pricing", { credentials: "include" });
  if (!response.ok) throw new Error("Pricing is unavailable. Please refresh and try again.");
  return response.json() as Promise<PricingResponse>;
}

function Field({ label, hint, value, onChange, ...props }: { label: string; hint?: string; value: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return <label className="block"><span className="field-label flex items-center justify-between"><span>{label}</span>{hint && <span className="text-[10px] font-normal text-[#779095]">{hint}</span>}</span><input {...props} className="field-control" value={value} onChange={onChange} /></label>;
}

export default function CalculatorPage({ standalone = false }: { standalone?: boolean }) {
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [form, setForm] = useState(initialForm);
  const [parcels, setParcels] = useState<Parcel[]>([newParcel(1)]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selected, setSelected] = useState("standard");
  const [errors, setErrors] = useState<string[]>([]);
  const [calculatedAt, setCalculatedAt] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => { void getPricing().then(setPricing).catch((error) => setLoadError(error instanceof Error ? error.message : "Pricing is unavailable.")); }, []);
  const updateForm = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const updateParcel = (id: string, key: keyof Parcel, value: string) => setParcels((current) => current.map((parcel) => parcel.id === id ? { ...parcel, [key]: value } : parcel));

  const calculate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pricing) return;
    const nextErrors: string[] = [];
    if (!form.originAddress.trim() || !form.destinationAddress.trim()) nextErrors.push("Add both collection and delivery addresses.");
    if (!/^\d{4}$/.test(form.originPostalCode) || !/^\d{4}$/.test(form.destinationPostalCode)) nextErrors.push("Postal codes must be 4 digits.");
    parcels.forEach((parcel, index) => {
      const values = [parcel.weightKg, parcel.lengthCm, parcel.widthCm, parcel.heightCm, parcel.quantity].map(Number);
      if (values.some((value) => value <= 0 || !Number.isFinite(value)) || !Number.isInteger(Number(parcel.quantity))) nextErrors.push(`${parcel.name || `Parcel ${index + 1}`} needs valid weight, dimensions and quantity.`);
    });
    const active = pricing.services.filter((service) => service.enabled && (form.selectedService === "all" || form.selectedService === service.id));
    if (!active.length) nextErrors.push("Choose an active delivery service.");
    setErrors(nextErrors);
    if (nextErrors.length) { setQuotes([]); return; }
    const results = active.map((service) => {
      const lines = parcels.map((parcel) => {
        const quantity = Number(parcel.quantity);
        const actualWeightKg = Number(parcel.weightKg);
        const volumetricWeightKg = Number(parcel.lengthCm) * Number(parcel.widthCm) * Number(parcel.heightCm) / service.volumetricDivisor;
        const chargeableWeightKg = Math.max(actualWeightKg, volumetricWeightKg);
        return { name: parcel.name, description: parcel.description, quantity, actualWeightKg, volumetricWeightKg, chargeableWeightKg, subtotalExVat: (service.basePrice + chargeableWeightKg * service.perKgPrice) * quantity };
      });
      const subtotalExVat = lines.reduce((sum, line) => sum + line.subtotalExVat, 0);
      return { service, lines, totalParcels: lines.reduce((sum, line) => sum + line.quantity, 0), chargeableWeightKg: lines.reduce((sum, line) => sum + line.chargeableWeightKg * line.quantity, 0), subtotalExVat, vatAmount: subtotalExVat * pricing.vatRate / 100, totalIncVat: subtotalExVat * (1 + pricing.vatRate / 100) };
    }).sort((a, b) => a.totalIncVat - b.totalIncVat);
    setQuotes(results);
    if (!results.some((quote) => quote.service.id === selected)) setSelected(results[0]?.service.id || "standard");
    setCalculatedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  };

  if (loadError) return <main className="container-wide py-16"><div className="paper-panel rounded-2xl p-8 text-center"><X className="mx-auto text-[#a53d1a]" /><h1 className="display-heading mt-4 text-3xl text-[#08263d]">Calculator unavailable</h1><p className="mt-3 text-[#527080]">{loadError}</p></div></main>;
  if (!pricing) return <main className="grid min-h-[60vh] place-items-center text-[#527080]">Loading your rates…</main>;
  const selectedQuote = quotes.find((quote) => quote.service.id === selected);

  return <main className="container-wide py-8 sm:py-12">
     <div className="mb-9 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="eyebrow">{standalone ? "Shareable quote" : "Customer quote"}</p><h1 className="display-heading mt-5 max-w-2xl text-5xl text-[#08263d] sm:text-6xl">{standalone ? <>Create a clear <span className="text-[#f36f21]">quote.</span></> : <>Know the cost <span className="text-[#f36f21]">before it moves.</span></>}</h1><p className="mt-4 max-w-xl leading-7 text-[#527080]">{standalone ? "Build a delivery quote without an account, then print or save it as a PDF to send to your customer." : "Build a clear quote for one parcel or a full shipment. Every parcel and price stays visible."}</p></div><div className="flex items-center gap-2 rounded-xl border border-[#d7e0dc] bg-white px-4 py-3 text-xs font-bold text-[#527080]"><Check size={16} className="text-[#0d634f]" /> {standalone ? "Ready to send" : "Indicative quote"}</div></div>
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
      <form onSubmit={calculate} className="space-y-5">
        <section className="paper-panel rounded-2xl p-5 sm:p-7"><div className="mb-6 flex items-start gap-3"><span className="grid size-8 place-items-center rounded-full bg-[#08263d] text-xs font-bold text-[#f7a061]">01</span><div><h2 className="font-display text-xl font-extrabold text-[#08263d]">Where is it going?</h2><p className="text-xs text-[#779095]">Add the route and quote customer details.</p></div></div><Field label="Customer or company" hint="optional" value={form.customerName} onChange={(event) => updateForm("customerName", event.target.value)} placeholder="e.g. Cape Town Coffee Co." /><div className="mt-5 grid gap-5 md:grid-cols-2"><div><Field label="Collection address" value={form.originAddress} onChange={(event) => updateForm("originAddress", event.target.value)} placeholder="12 Loop Street, Cape Town" /><div className="mt-4"><Field label="Collection postal code" value={form.originPostalCode} onChange={(event) => updateForm("originPostalCode", event.target.value.replace(/\D/g, ""))} maxLength={4} inputMode="numeric" placeholder="8001" /></div></div><div><Field label="Delivery address" value={form.destinationAddress} onChange={(event) => updateForm("destinationAddress", event.target.value)} placeholder="22 Fox Street, Johannesburg" /><div className="mt-4"><Field label="Delivery postal code" value={form.destinationPostalCode} onChange={(event) => updateForm("destinationPostalCode", event.target.value.replace(/\D/g, ""))} maxLength={4} inputMode="numeric" placeholder="2001" /></div></div></div><div className="mt-4"><Field label="Delivery recipient" hint="optional" value={form.destinationCustomerName} onChange={(event) => updateForm("destinationCustomerName", event.target.value)} placeholder="Recipient name or company" /></div></section>
        <section className="paper-panel rounded-2xl p-5 sm:p-7"><div className="mb-6 flex items-start justify-between gap-3"><div className="flex items-start gap-3"><span className="grid size-8 place-items-center rounded-full bg-[#08263d] text-xs font-bold text-[#f7a061]">02</span><div><h2 className="font-display text-xl font-extrabold text-[#08263d]">What are we moving?</h2><p className="text-xs text-[#779095]">Add parcel sizes separately or use quantity.</p></div></div><button type="button" onClick={() => setParcels((current) => [...current, newParcel(current.length + 1)])} className="btn-ghost min-h-9 px-3 text-xs"><Plus size={14} /> Add parcel</button></div>{parcels.map((parcel, index) => <div className="mb-4 rounded-xl border border-[#d7e0dc] bg-[#fbfdf9] p-4 last:mb-0" key={parcel.id}><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><span className="grid size-6 place-items-center rounded-full bg-[#dcece8] text-[10px] font-bold text-[#0d634f]">{String(index + 1).padStart(2, "0")}</span><input aria-label={`Parcel ${index + 1} name`} value={parcel.name} onChange={(event) => updateParcel(parcel.id, "name", event.target.value)} className="w-36 border-b border-transparent bg-transparent font-display text-sm font-extrabold text-[#08263d] outline-none focus:border-[#f36f21]" /></div>{parcels.length > 1 && <button type="button" onClick={() => setParcels((current) => current.filter((item) => item.id !== parcel.id))} className="flex items-center gap-1 text-xs font-bold text-[#a53d1a]"><Trash2 size={13} /> Remove</button>}</div><Field label="Parcel description" hint="optional" value={parcel.description} onChange={(event) => updateParcel(parcel.id, "description", event.target.value)} placeholder="e.g. Coffee equipment" /><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Field label="Weight" hint="kg" type="number" min="0" step="0.1" value={parcel.weightKg} onChange={(event) => updateParcel(parcel.id, "weightKg", event.target.value)} placeholder="2.5" /><Field label="Length" hint="cm" type="number" min="0" step="0.1" value={parcel.lengthCm} onChange={(event) => updateParcel(parcel.id, "lengthCm", event.target.value)} placeholder="40" /><Field label="Width" hint="cm" type="number" min="0" step="0.1" value={parcel.widthCm} onChange={(event) => updateParcel(parcel.id, "widthCm", event.target.value)} placeholder="30" /><Field label="Height" hint="cm" type="number" min="0" step="0.1" value={parcel.heightCm} onChange={(event) => updateParcel(parcel.id, "heightCm", event.target.value)} placeholder="20" /><Field label="Quantity" hint="pieces" type="number" min="1" step="1" value={parcel.quantity} onChange={(event) => updateParcel(parcel.id, "quantity", event.target.value)} placeholder="1" /></div></div>)}<div className="mt-5 flex items-start gap-2 rounded-xl bg-[#e9f4f0] p-3 text-xs leading-5 text-[#386b67]"><Info size={15} className="mt-0.5 shrink-0 text-[#0d634f]" /> Billable weight uses the higher of actual and volumetric weight.</div></section>
        <section className="paper-panel rounded-2xl p-5 sm:p-7"><div className="mb-6 flex items-start gap-3"><span className="grid size-8 place-items-center rounded-full bg-[#08263d] text-xs font-bold text-[#f7a061]">03</span><div><h2 className="font-display text-xl font-extrabold text-[#08263d]">Choose a service</h2><p className="text-xs text-[#779095]">Compare all available services or quote one option.</p></div></div><select value={form.selectedService} onChange={(event) => updateForm("selectedService", event.target.value)} className="field-control"><option value="all">Compare all available services</option>{pricing.services.filter((service) => service.enabled).map((service) => <option value={service.id} key={service.id}>{service.name} · {service.deliveryWindow}</option>)}</select></section>
        {errors.length > 0 && <div className="flex items-start gap-2 rounded-xl border border-[#f2b5a5] bg-[#fff0eb] p-4 text-sm font-bold text-[#a53d1a]" role="alert"><X size={16} className="mt-0.5 shrink-0" /><div>{errors.map((error) => <p key={error}>{error}</p>)}</div></div>}
         <button type="submit" className="btn-primary w-full sm:w-auto"><Gauge size={17} /> {standalone ? "Calculate quote" : "Calculate my quote"} <ArrowRight size={17} /></button>
      </form>
      <aside><div className="sticky top-28"><div className="mb-3 flex items-end justify-between"><div><p className="eyebrow">Your options</p><h2 className="font-display mt-3 text-2xl font-extrabold text-[#08263d]">A fair comparison.</h2></div>{calculatedAt && <span className="text-[10px] text-[#779095]">Updated {calculatedAt}</span>}</div>{quotes.length === 0 ? <div className="paper-panel rounded-2xl border-dashed p-7"><Package className="text-[#f36f21]" size={27} /><h3 className="font-display mt-5 text-xl font-extrabold text-[#08263d]">Your quote lives here.</h3><p className="mt-2 text-sm leading-6 text-[#527080]">Add your route and parcel details, then we’ll turn them into a simple price comparison.</p></div> : <div className="space-y-3">{quotes.map((quote) => <button type="button" key={quote.service.id} onClick={() => setSelected(quote.service.id)} className={`relative w-full rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 ${selected === quote.service.id ? "border-[#f36f21] bg-[#fff7f0] shadow-[0_0_0_2px_rgba(243,111,33,.12)]" : "border-[#d7e0dc] bg-white"}`}>{quote.service.popular && <span className="absolute -top-2 right-4 rounded-full bg-[#f7a061] px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-[#08263d]">Most chosen</span>}<div className="flex items-start gap-3"><span className={`grid size-9 shrink-0 place-items-center rounded-lg ${selected === quote.service.id ? "bg-[#f36f21] text-white" : "bg-[#e9f4f0] text-[#0d634f]"}`}><Truck size={17} /></span><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><span><strong className="font-display text-sm text-[#08263d]">{quote.service.name}</strong><span className="mt-1 block text-xs text-[#527080]">{quote.service.description}</span></span><strong className="font-display text-xl text-[#08263d]">{money(quote.totalIncVat)}</strong></span><span className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#d7e0dc] pt-3 text-[10px] text-[#779095]"><span>{quote.service.deliveryWindow}</span><span>{quote.totalParcels} parcel{quote.totalParcels === 1 ? "" : "s"}</span><span>{quote.chargeableWeightKg.toFixed(1)} kg billable</span><span className="ml-auto font-bold text-[#0d634f]">{selected === quote.service.id ? "Selected" : "Choose"}</span></span></span></div><span className="mt-2 block text-right text-[10px] text-[#779095]">ex VAT {money(quote.subtotalExVat)} · VAT {money(quote.vatAmount)}</span></button>)}{selectedQuote && <div className="rounded-2xl bg-[#08263d] p-5 text-white"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#f7a061]">Selected service</p><h3 className="font-display mt-1 text-lg font-extrabold">{selectedQuote.service.name}</h3></div><strong className="font-display text-2xl text-[#f7a061]">{money(selectedQuote.totalIncVat)}</strong></div><div className="mt-4 flex items-center justify-between border-t border-[#2e5b70] pt-3 text-[10px] text-[#b8ccd7]"><span>Includes {pricing.vatRate}% VAT</span><span className="flex items-center gap-1 text-[#b9e4df]"><Check size={13} /> Transparent</span></div><button type="button" onClick={() => window.print()} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#f7a061] text-xs font-extrabold text-[#08263d]"><Printer size={14} /> Print / save as PDF</button></div>}<p className="flex gap-1 px-1 text-[10px] leading-5 text-[#779095]"><CircleHelp size={12} className="mt-1 shrink-0" /> Quotes are indicative and may change after final parcel verification.</p></div>}</div></aside>
    </div>
  </main>;
}