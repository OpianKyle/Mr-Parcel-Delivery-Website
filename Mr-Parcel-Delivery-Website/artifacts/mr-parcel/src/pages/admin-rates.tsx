import { useEffect, useState } from "react";
import { Check, Info, RotateCcw, Save, Settings2, Truck } from "lucide-react";
import type { PricingResponse, Service } from "./calculator";

export default function AdminRatesPage() {
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    void fetch("/api/pricing", { credentials: "include" }).then(async (response) => {
      if (!response.ok) throw new Error("Could not load pricing.");
      return response.json() as Promise<PricingResponse>;
    }).then(setPricing).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not load pricing."));
  }, []);

  const updateService = (id: string, key: keyof Service, value: string | boolean) => {
    setPricing((current) => current ? { ...current, services: current.services.map((service) => service.id === id ? { ...service, [key]: key === "name" || key === "description" || key === "deliveryWindow" || typeof value === "boolean" ? value : Number(value) } as Service : service) } : current);
  };
  const reset = () => {
    if (!pricing) return;
    setPricing({ ...pricing, services: pricing.services.map((service) => ({ ...service, enabled: true })) });
    setSaved(false);
  };
  const save = async () => {
    if (!pricing) return;
    setError("");
    const response = await fetch("/api/pricing", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pricing) });
    if (!response.ok) { const body = await response.json().catch(() => ({})) as { error?: string }; setError(body.error || "Could not save pricing."); return; }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  if (error && !pricing) return <main className="container-wide py-16"><div className="paper-panel rounded-2xl p-8 text-center text-[#a53d1a]">{error}</div></main>;
  if (!pricing) return <main className="grid min-h-[60vh] place-items-center text-[#527080]">Loading admin settings…</main>;

  return <main className="container-wide py-8 sm:py-12"><div className="mb-9 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="eyebrow">Admin controls</p><h1 className="display-heading mt-5 text-5xl text-[#08263d] sm:text-6xl">Tune the <span className="text-[#f36f21]">numbers.</span></h1><p className="mt-4 max-w-xl leading-7 text-[#527080]">These settings power the customer calculator for every signed-in account.</p></div><div className="flex items-center gap-2 rounded-xl border border-[#b4d3cf] bg-[#e9f4f0] px-4 py-3 text-xs font-bold text-[#386b67]"><Settings2 size={16} /> Server-backed pricing</div></div><div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]"><section className="space-y-4"><div className="paper-panel overflow-hidden rounded-2xl"><div className="flex flex-col gap-4 border-b border-[#d7e0dc] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7"><div><h2 className="font-display text-xl font-extrabold text-[#08263d]">Delivery services</h2><p className="mt-1 text-xs text-[#779095]">Edit the assumptions used in new quotes.</p></div><button type="button" onClick={reset} className="btn-ghost min-h-9 px-3 text-xs"><RotateCcw size={13} /> Enable all</button></div>{pricing.services.map((service) => <div className="border-b border-[#d7e0dc] p-5 last:border-b-0 sm:p-7" key={service.id}><div className="mb-5 flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#e9f4f0] text-[#0d634f]"><Truck size={17} /></span><div className="flex-1"><h3 className="font-display text-base font-extrabold text-[#08263d]">{service.name}</h3><p className="mt-1 text-xs text-[#779095]">{service.description}</p></div><label className="flex items-center gap-2 text-xs font-bold text-[#527080]"><input type="checkbox" checked={service.enabled} onChange={(event) => updateService(service.id, "enabled", event.target.checked)} /> Active</label></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{([["basePrice", "Base price", service.basePrice], ["perKgPrice", "Price per kg", service.perKgPrice], ["volumetricDivisor", "Volumetric divisor", service.volumetricDivisor], ["deliveryWindow", "Delivery window", service.deliveryWindow]] as const).map(([key, label, value]) => <label key={key}><span className="field-label text-xs">{label}</span><input className="field-control" type={typeof value === "number" ? "number" : "text"} value={value} onChange={(event) => updateService(service.id, key, event.target.value)} /></label>)}</div></div>)}</div></section><aside><div className="sticky top-28 rounded-2xl bg-[#08263d] p-6 text-white"><div className="flex items-center gap-2 text-[#f7a061]"><Settings2 size={17} /><span className="text-[10px] font-extrabold uppercase tracking-wider">Pricing settings</span></div><h2 className="font-display mt-4 text-2xl font-extrabold">One switch.<br />Clearer quotes.</h2><p className="mt-3 text-xs leading-5 text-[#b8ccd7]">VAT is applied after the parcel price so customers can always see the split.</p><label className="mt-7 block"><span className="field-label !text-[#fffaf1]">VAT rate</span><input className="field-control text-lg font-extrabold" type="number" min="0" max="100" step="0.5" value={pricing.vatRate} onChange={(event) => setPricing({ ...pricing, vatRate: Number(event.target.value) })} /></label><button type="button" onClick={() => void save()} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#f7a061] text-xs font-extrabold text-[#08263d]">{saved ? <><Check size={15} /> Saved to MySQL</> : <><Save size={15} /> Save pricing changes</>}</button>{error && <p className="mt-4 text-xs font-bold text-[#f7a061]">{error}</p>}</div><div className="mt-4 flex items-start gap-2 px-1 text-[10px] leading-5 text-[#779095]"><Info size={13} className="mt-1 shrink-0" /> Customers see only enabled services. This section is admin-only.</div></aside></div></main>;
}