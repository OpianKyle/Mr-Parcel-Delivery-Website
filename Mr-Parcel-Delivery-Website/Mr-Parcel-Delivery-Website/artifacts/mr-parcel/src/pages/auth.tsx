import { createContext, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Check, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, useLocation } from "wouter";

export type User = {
  id: number;
  email: string;
  fullName: string;
  role: "customer" | "admin";
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (fullName: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(body.error || "Something went wrong. Please try again.");
  return body;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const result = await apiRequest<{ user: User | null }>("/api/auth/me");
      setUser(result.user);
      return result.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    refresh,
    login: async (email, password) => {
      const result = await apiRequest<{ user: User }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setUser(result.user);
      return result.user;
    },
    register: async (fullName, email, password) => {
      const result = await apiRequest<{ user: User }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password }),
      });
      setUser(result.user);
      return result.user;
    },
    logout: async () => {
      await apiRequest("/api/auth/logout", { method: "POST" });
      setUser(null);
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

export function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loading, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) setLocation(user.role === "admin" ? "/admin/rates" : "/calculator");
  }, [setLocation, user]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const nextUser = mode === "login"
        ? await login(email, password)
        : await register(fullName, email, password);
      setLocation(nextUser.role === "admin" ? "/admin/rates" : "/calculator");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to continue.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#fffaf1] text-[#527080]">Loading your portal…</div>;

  return (
    <main className="min-h-screen bg-[#fffaf1] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_460px]">
        <section className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-3 text-[#08263d]">
            <span className="grid h-12 w-16 place-items-center rounded-2xl bg-[#f36f21] text-lg font-black text-white">MP</span>
            <span className="font-display text-xl font-extrabold tracking-[-.05em]">Mr <span className="text-[#f36f21]">PARCEL</span></span>
          </Link>
          <p className="eyebrow mt-20">Client portal</p>
          <h1 className="display-heading mt-6 max-w-xl text-6xl text-[#08263d]">Clear quotes, before the parcel moves.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#527080]">Create an account to use the delivery calculator. Your account keeps the quoting workspace separate from the public website.</p>
          <div className="mt-10 space-y-4 text-sm font-bold text-[#21465a]">
            {["Compare delivery services", "Add multiple parcel sizes", "Print a clear quote breakdown"].map((item) => (
              <div className="flex items-center gap-3" key={item}><span className="grid size-7 place-items-center rounded-full bg-[#dcece8] text-[#0d634f]"><Check size={15} /></span>{item}</div>
            ))}
          </div>
        </section>

        <section className="paper-panel soft-shadow rounded-3xl border-t-4 border-t-[#f36f21] p-6 sm:p-9">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="font-display text-xl font-extrabold tracking-[-.05em] text-[#08263d]">Mr <span className="text-[#f36f21]">PARCEL</span></Link>
          </div>
          <div className="flex gap-1 rounded-xl bg-[#e9f4f0] p-1">
            {(["login", "register"] as const).map((item) => (
              <button type="button" key={item} onClick={() => { setMode(item); setError(""); }} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-extrabold capitalize transition-colors ${mode === item ? "bg-[#08263d] text-white" : "text-[#527080]"}`}>
                {item === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
          <div className="mt-8">
            <p className="eyebrow">{mode === "login" ? "Welcome back" : "New customer"}</p>
            <h2 className="display-heading mt-4 text-4xl text-[#08263d]">{mode === "login" ? "Open your calculator." : "Start with an account."}</h2>
            <p className="mt-3 text-sm leading-6 text-[#527080]">{mode === "login" ? "Sign in to continue to your private quote workspace." : "Customer accounts unlock the calculator. Admin tools are assigned separately."}</p>
          </div>
          <form onSubmit={submit} className="mt-8 space-y-5">
            {mode === "register" && <label><span className="field-label">Full name</span><span className="relative block"><UserRound className="absolute left-3 top-3.5 text-[#779095]" size={17} /><input className="field-control pl-10" autoComplete="name" required minLength={2} value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" /></span></label>}
            <label><span className="field-label">Email address</span><span className="relative block"><Mail className="absolute left-3 top-3.5 text-[#779095]" size={17} /><input className="field-control pl-10" autoComplete="email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></span></label>
            <label><span className="field-label">Password</span><span className="relative block"><LockKeyhole className="absolute left-3 top-3.5 text-[#779095]" size={17} /><input className="field-control pl-10" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></span></label>
            {error && <p className="rounded-xl border border-[#f2b5a5] bg-[#fff0eb] p-3 text-sm font-bold text-[#a53d1a]" role="alert">{error}</p>}
            <button className="btn-primary w-full" type="submit" disabled={submitting}>{submitting ? "Opening portal…" : mode === "login" ? "Sign in to calculator" : "Create customer account"} <ArrowRight size={17} /></button>
          </form>
          <p className="mt-6 text-center text-xs leading-5 text-[#779095]">Your password is encrypted before it is stored. Admin-only sections are protected on the server.</p>
        </section>
      </div>
    </main>
  );
}

export function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && !user) setLocation("/login");
  }, [loading, setLocation, user]);
  if (loading || !user) return <div className="grid min-h-screen place-items-center bg-[#fffaf1] text-[#527080]">Checking your access…</div>;
  if (adminOnly && user.role !== "admin") {
    return <div className="grid min-h-screen place-items-center bg-[#fffaf1] p-6 text-center"><div><p className="eyebrow justify-center">Admin access only</p><h1 className="display-heading mt-5 text-4xl text-[#08263d]">That section is private.</h1><p className="mt-3 text-[#527080]">Your customer account can still use the quote calculator.</p><Link href="/calculator" className="btn-primary mt-7">Back to calculator <ArrowRight size={17} /></Link></div></div>;
  }
  return <>{children}</>;
}

export function PortalLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-[#fffaf1]">
      <header className="sticky top-0 z-30 border-b border-[#173e54] bg-[#08263d] text-white">
        <div className="container-wide flex min-h-[4.6rem] items-center justify-between gap-4">
          <Link href="/" className="font-display text-lg font-extrabold tracking-[-.05em]">Mr <span className="text-[#f7a061]">PARCEL</span><span className="ml-3 hidden text-[10px] font-bold uppercase tracking-[.16em] text-[#b8ccd7] sm:inline">Portal</span></Link>
          <nav className="flex items-center gap-2 text-sm font-bold">
            <Link href="/calculator" className="rounded-lg px-3 py-2 text-[#d9e6e6] hover:bg-[#123c55] hover:text-[#f7a061]">Calculator</Link>
            {user?.role === "admin" && <><Link href="/admin/rates" className="hidden rounded-lg px-3 py-2 text-[#d9e6e6] hover:bg-[#123c55] hover:text-[#f7a061] sm:inline">Admin rates</Link><Link href="/admin/users" className="hidden rounded-lg px-3 py-2 text-[#d9e6e6] hover:bg-[#123c55] hover:text-[#f7a061] sm:inline">Admin accounts</Link></>}
            <button type="button" onClick={() => { void logout().then(() => setLocation("/login")); }} className="rounded-lg border border-[#2e5b70] px-3 py-2 text-[#d9e6e6] hover:border-[#f7a061] hover:text-[#f7a061]">Sign out</button>
          </nav>
        </div>
      </header>
      <div className="container-wide border-b border-[#d7e0dc] py-3 text-xs text-[#527080]">Signed in as <strong className="text-[#08263d]">{user?.fullName}</strong> · {user?.role === "admin" ? "Administrator" : "Customer"}</div>
      {children}
    </div>
  );
}