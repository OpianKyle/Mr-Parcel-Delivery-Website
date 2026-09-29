import { useEffect, useState, type FormEvent } from "react";
import { Check, LockKeyhole, Mail, ShieldPlus, UserRound, X } from "lucide-react";

type AdminUser = {
  id: number;
  email: string;
  fullName: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAdmins = async () => {
    const response = await fetch("/api/admin/users", { credentials: "include" });
    const body = await response.json().catch(() => ({})) as { users?: AdminUser[]; error?: string };
    if (!response.ok) throw new Error(body.error || "Could not load admin accounts.");
    setAdmins(body.users || []);
  };

  useEffect(() => {
    void loadAdmins().catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not load admin accounts.")).finally(() => setLoading(false));
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Could not create the admin account.");
      setFullName("");
      setEmail("");
      setPassword("");
      setSuccess("Admin account created. They can sign in immediately.");
      await loadAdmins();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create the admin account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container-wide py-8 sm:py-12">
      <div className="mb-9">
        <p className="eyebrow">Admin controls</p>
        <h1 className="display-heading mt-5 text-5xl text-[#08263d] sm:text-6xl">Add a trusted <span className="text-[#f36f21]">admin.</span></h1>
        <p className="mt-4 max-w-xl leading-7 text-[#527080]">Create another administrator account without sharing your own login. Only existing admins can open this page or create accounts.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="paper-panel rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#e9f4f0] text-[#0d634f]"><ShieldPlus size={20} /></span>
            <div><h2 className="font-display text-xl font-extrabold text-[#08263d]">New administrator</h2><p className="mt-1 text-xs leading-5 text-[#779095]">Use a unique email and a strong password.</p></div>
          </div>
          <form onSubmit={submit} className="mt-7 space-y-5">
            <label><span className="field-label">Full name</span><span className="relative block"><UserRound className="absolute left-3 top-3.5 text-[#779095]" size={17} /><input className="field-control pl-10" autoComplete="name" required minLength={2} value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Administrator name" /></span></label>
            <label><span className="field-label">Email address</span><span className="relative block"><Mail className="absolute left-3 top-3.5 text-[#779095]" size={17} /><input className="field-control pl-10" autoComplete="email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" /></span></label>
            <label><span className="field-label">Temporary password</span><span className="relative block"><LockKeyhole className="absolute left-3 top-3.5 text-[#779095]" size={17} /><input className="field-control pl-10" autoComplete="new-password" required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></span></label>
            {error && <p className="flex items-start gap-2 rounded-xl border border-[#f2b5a5] bg-[#fff0eb] p-3 text-sm font-bold text-[#a53d1a]" role="alert"><X size={16} className="mt-0.5 shrink-0" />{error}</p>}
            {success && <p className="flex items-start gap-2 rounded-xl border border-[#a8cbc7] bg-[#e9f4f0] p-3 text-sm font-bold text-[#0d634f]" role="status"><Check size={16} className="mt-0.5 shrink-0" />{success}</p>}
            <button className="btn-primary w-full sm:w-auto" type="submit" disabled={saving}>{saving ? "Creating account…" : "Create admin account"} <ShieldPlus size={17} /></button>
          </form>
        </section>

        <aside className="rounded-2xl bg-[#08263d] p-6 text-white sm:p-8">
          <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#f7a061]">Current administrators</p>
          <h2 className="font-display mt-4 text-2xl font-extrabold">Who can manage Mr Parcel.</h2>
          {loading ? <p className="mt-6 text-sm text-[#b8ccd7]">Loading accounts…</p> : (
            <div className="mt-6 divide-y divide-[#2e5b70]">
              {admins.map((admin) => <div className="flex items-start gap-3 py-4 first:pt-0 last:pb-0" key={admin.id}><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#123c55] text-[#b9e4df]"><UserRound size={16} /></span><div className="min-w-0"><p className="truncate text-sm font-extrabold">{admin.fullName}</p><p className="mt-1 truncate text-xs text-[#b8ccd7]">{admin.email}</p></div></div>)}
            </div>
          )}
          <p className="mt-7 border-t border-[#2e5b70] pt-5 text-xs leading-5 text-[#b8ccd7]">Admin accounts can change pricing and add other administrators. Customer accounts cannot see these controls.</p>
        </aside>
      </div>
    </main>
  );
}