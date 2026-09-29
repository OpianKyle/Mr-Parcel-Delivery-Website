import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight, Check, CircleAlert, Mail, MapPin, Package, Phone, Plus, Send, Trash2, UserRound, X } from "lucide-react";

type ParcelDetails = {
  id: string;
  name: string;
  description: string;
  weightKg: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  quantity: string;
};

type DetailsForm = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupAddress: string;
  pickupPostalCode: string;
  pickupDate: string;
  dropoffName: string;
  dropoffAddress: string;
  dropoffPostalCode: string;
  preferredTime: string;
  notes: string;
};

const initialForm: DetailsForm = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  pickupAddress: "",
  pickupPostalCode: "",
  pickupDate: "",
  dropoffName: "",
  dropoffAddress: "",
  dropoffPostalCode: "",
  preferredTime: "",
  notes: "",
};

const newParcel = (index: number): ParcelDetails => ({
  id: `details-parcel-${Date.now()}-${index}`,
  name: `Parcel ${String(index).padStart(2, "0")}`,
  description: "",
  weightKg: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  quantity: "1",
});

function Field({
  label,
  hint,
  value,
  onChange,
  ...props
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="field-label flex items-center justify-between">
        <span>{label}</span>{hint && <span className="text-[10px] font-normal text-[#779095]">{hint}</span>}
      </span>
      <input {...props} className="field-control" value={value} onChange={onChange} />
    </label>
  );
}

export default function DetailsPage() {
  const [form, setForm] = useState(initialForm);
  const [parcels, setParcels] = useState<ParcelDetails[]>([newParcel(1)]);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const updateForm = (key: keyof DetailsForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus("idle");
  };
  const updateParcel = (id: string, key: keyof ParcelDetails, value: string) => {
    setParcels((current) => current.map((parcel) => parcel.id === id ? { ...parcel, [key]: value } : parcel));
    setStatus("idle");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: string[] = [];
    if (!form.customerName.trim()) nextErrors.push("Add your name or company name.");
    if (!form.customerEmail.trim() && !form.customerPhone.trim()) nextErrors.push("Add an email address or phone / WhatsApp number.");
    if (form.customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim())) nextErrors.push("Enter a valid email address.");
    if (!form.pickupAddress.trim() || !form.dropoffAddress.trim()) nextErrors.push("Add both the collection and delivery addresses.");
    if (!parcels.some((parcel) => parcel.description.trim() || parcel.weightKg.trim())) nextErrors.push("Add a description or weight for at least one parcel.");
    setErrors(nextErrors);
    if (nextErrors.length) {
      setStatus("error");
      setStatusMessage("");
      return;
    }

    setStatus("sending");
    setStatusMessage("");
    try {
      const response = await fetch("/api/quote-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, parcels }),
      });
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(body.error || "We couldn't send your details.");
      setErrors([]);
      setStatus("success");
      setStatusMessage("Your details have been sent. Lance will get back to you with a quote.");
      setForm(initialForm);
      setParcels([newParcel(1)]);
    } catch (error) {
      setStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "We couldn't send your details. Please try again.");
    }
  };

  return (
    <main className="bg-[#fffaf1]">
      <section className="dark-panel">
        <div className="container-wide py-14 sm:py-20">
          <p className="eyebrow !text-[#f7a061]">Delivery details</p>
          <h1 className="display-heading mt-5 max-w-3xl text-5xl text-[#fffaf1] sm:text-6xl">Tell us what needs <span className="text-[#f7a061]">moving.</span></h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#b8ccd7] sm:text-lg">Share the route and parcel details below. We’ll review everything and send you a quote. No prices are shown on this form.</p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <form onSubmit={submit} className="space-y-5" noValidate>
            <section className="paper-panel rounded-2xl p-5 sm:p-7">
              <div className="mb-6 flex items-start gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-[#08263d] text-xs font-bold text-[#f7a061]">01</span>
                <div><h2 className="font-display text-xl font-extrabold text-[#08263d]">How can we reach you?</h2><p className="text-xs text-[#779095]">Give us one reliable way to reply.</p></div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Your name or company" value={form.customerName} onChange={(event) => updateForm("customerName", event.target.value)} placeholder="e.g. Alex or Cape Town Coffee Co." autoComplete="name" />
                <Field label="Email address" hint="optional if phone is provided" value={form.customerEmail} onChange={(event) => updateForm("customerEmail", event.target.value)} placeholder="you@example.com" type="email" autoComplete="email" />
                <Field label="Phone / WhatsApp" hint="optional if email is provided" value={form.customerPhone} onChange={(event) => updateForm("customerPhone", event.target.value)} placeholder="e.g. 078 830 9300" type="tel" autoComplete="tel" />
              </div>
            </section>

            <section className="paper-panel rounded-2xl p-5 sm:p-7">
              <div className="mb-6 flex items-start gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-[#08263d] text-xs font-bold text-[#f7a061]">02</span>
                <div><h2 className="font-display text-xl font-extrabold text-[#08263d]">Where is it going?</h2><p className="text-xs text-[#779095]">The route helps us plan the right handover.</p></div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Field label="Collection address" value={form.pickupAddress} onChange={(event) => updateForm("pickupAddress", event.target.value)} placeholder="12 Loop Street, Cape Town" autoComplete="street-address" />
                  <div className="mt-4"><Field label="Collection postal code" hint="optional" value={form.pickupPostalCode} onChange={(event) => updateForm("pickupPostalCode", event.target.value)} placeholder="8001" inputMode="numeric" /></div>
                  <div className="mt-4"><Field label="Preferred collection date" hint="optional" value={form.pickupDate} onChange={(event) => updateForm("pickupDate", event.target.value)} type="date" /></div>
                </div>
                <div>
                  <Field label="Delivery address" value={form.dropoffAddress} onChange={(event) => updateForm("dropoffAddress", event.target.value)} placeholder="22 Fox Street, Johannesburg" autoComplete="street-address" />
                  <div className="mt-4"><Field label="Delivery postal code" hint="optional" value={form.dropoffPostalCode} onChange={(event) => updateForm("dropoffPostalCode", event.target.value)} placeholder="2001" inputMode="numeric" /></div>
                  <div className="mt-4"><Field label="Delivery recipient" hint="optional" value={form.dropoffName} onChange={(event) => updateForm("dropoffName", event.target.value)} placeholder="Recipient name or company" /></div>
                </div>
              </div>
              <label className="mt-5 block"><span className="field-label">Preferred delivery time</span><select className="field-control" value={form.preferredTime} onChange={(event) => updateForm("preferredTime", event.target.value)}><option value="">No preference</option><option>Morning</option><option>Afternoon</option><option>After 17:00</option></select></label>
            </section>

            <section className="paper-panel rounded-2xl p-5 sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3"><span className="grid size-8 place-items-center rounded-full bg-[#08263d] text-xs font-bold text-[#f7a061]">03</span><div><h2 className="font-display text-xl font-extrabold text-[#08263d]">What are we moving?</h2><p className="text-xs text-[#779095]">Add one or more parcels. Pricing comes later.</p></div></div>
                <button type="button" onClick={() => setParcels((current) => [...current, newParcel(current.length + 1)])} className="btn-ghost min-h-9 px-3 text-xs"><Plus size={14} /> Add parcel</button>
              </div>
              {parcels.map((parcel, index) => (
                <div className="mb-4 rounded-xl border border-[#d7e0dc] bg-[#fbfdf9] p-4 last:mb-0" key={parcel.id}>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2"><span className="grid size-6 place-items-center rounded-full bg-[#dcece8] text-[10px] font-bold text-[#0d634f]">{String(index + 1).padStart(2, "0")}</span><input aria-label={`Parcel ${index + 1} name`} value={parcel.name} onChange={(event) => updateParcel(parcel.id, "name", event.target.value)} className="w-36 border-b border-transparent bg-transparent font-display text-sm font-extrabold text-[#08263d] outline-none focus:border-[#f36f21]" /></div>
                    {parcels.length > 1 && <button type="button" onClick={() => setParcels((current) => current.filter((item) => item.id !== parcel.id))} className="flex items-center gap-1 text-xs font-bold text-[#a53d1a]"><Trash2 size={13} /> Remove</button>}
                  </div>
                  <Field label="Parcel description" value={parcel.description} onChange={(event) => updateParcel(parcel.id, "description", event.target.value)} placeholder="e.g. Small clothing box or coffee equipment" />
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <Field label="Weight" hint="kg" type="number" min="0" step="0.1" value={parcel.weightKg} onChange={(event) => updateParcel(parcel.id, "weightKg", event.target.value)} placeholder="2.5" />
                    <Field label="Length" hint="cm" type="number" min="0" step="0.1" value={parcel.lengthCm} onChange={(event) => updateParcel(parcel.id, "lengthCm", event.target.value)} placeholder="40" />
                    <Field label="Width" hint="cm" type="number" min="0" step="0.1" value={parcel.widthCm} onChange={(event) => updateParcel(parcel.id, "widthCm", event.target.value)} placeholder="30" />
                    <Field label="Height" hint="cm" type="number" min="0" step="0.1" value={parcel.heightCm} onChange={(event) => updateParcel(parcel.id, "heightCm", event.target.value)} placeholder="20" />
                    <Field label="Quantity" hint="pieces" type="number" min="1" step="1" value={parcel.quantity} onChange={(event) => updateParcel(parcel.id, "quantity", event.target.value)} placeholder="1" />
                  </div>
                </div>
              ))}
            </section>

            <section className="paper-panel rounded-2xl p-5 sm:p-7">
              <label className="block"><span className="field-label">Anything else we should know?</span><textarea className="field-control min-h-32 resize-y" value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} placeholder="Fragile items, access instructions, preferred handover details..." /></label>
            </section>

            {errors.length > 0 && <div className="flex items-start gap-2 rounded-xl border border-[#f2b5a5] bg-[#fff0eb] p-4 text-sm font-bold text-[#a53d1a]" role="alert"><X size={16} className="mt-0.5 shrink-0" /><div>{errors.map((error) => <p key={error}>{error}</p>)}</div></div>}
            {statusMessage && <div className={`flex items-start gap-2 rounded-xl p-4 text-sm font-bold ${status === "success" ? "bg-[#e9f4f0] text-[#0d634f]" : "border border-[#f2b5a5] bg-[#fff0eb] text-[#a53d1a]"}`} role={status === "success" ? "status" : "alert"}>{status === "success" ? <Check size={17} className="mt-0.5 shrink-0" /> : <CircleAlert size={17} className="mt-0.5 shrink-0" />}<p>{statusMessage}</p></div>}
            <button type="submit" className="btn-primary w-full sm:w-auto" disabled={status === "sending"}>{status === "sending" ? "Sending details…" : "Send details for a quote"} {status === "sending" ? <Send size={17} /> : <ArrowRight size={17} />}</button>
          </form>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <div className="rounded-2xl bg-[#08263d] p-6 text-white">
              <div className="flex items-center gap-2 text-[#f7a061]"><Package size={18} /><span className="text-[10px] font-extrabold uppercase tracking-wider">No pricing here</span></div>
              <h2 className="font-display mt-4 text-2xl font-extrabold">We’ll work out the right quote.</h2>
              <p className="mt-3 text-sm leading-6 text-[#b8ccd7]">This form only captures the information needed to review your delivery. Lance will confirm the route, timing and price with you.</p>
              <ul className="mt-6 space-y-3 text-sm text-[#d9e6e6]">
                <li className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#f7a061]" /> Multiple parcels are welcome</li>
                <li className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#f7a061]" /> Add dimensions if you have them</li>
                <li className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#f7a061]" /> We reply using your contact details</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-[#dcece8] p-6">
              <p className="text-xs font-extrabold uppercase tracking-[.13em] text-[#386b67]">Need a quick answer?</p>
              <p className="mt-3 text-sm leading-6 text-[#386b67]">You can also reach Mr Parcel directly on WhatsApp.</p>
              <a href="https://wa.me/27788309300" target="_blank" rel="noreferrer" className="btn-secondary mt-5"><Phone size={17} /> WhatsApp us</a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}