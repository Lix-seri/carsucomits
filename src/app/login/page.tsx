"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, GraduationCap, Shield } from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

type LoginRole = "STUDENT" | "ADMIN";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<LoginRole>("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.endsWith("@carsu.edu.ph")) {
      setError("Use your @carsu.edu.ph email to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, expectedRole: role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Login failed."); return; }
      const dest = data.user?.role === "ADMIN" ? "/admin" : "/dashboard";
      router.replace(dest);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-brand-50/40">
      <Link href="/" className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="grid min-h-screen place-items-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <div className="mb-6 flex flex-col items-center text-center">
            <Logo />
            <h1 className="mt-5 text-2xl font-bold">Welcome Back!</h1>
            <p className="mt-1 text-sm text-slate-500">Login to your CSU commission account</p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-semibold transition",
                role === "STUDENT" ? "bg-white text-ink shadow-card" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <GraduationCap className="h-4 w-4" /> Student
            </button>
            <button
              type="button"
              onClick={() => setRole("ADMIN")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-semibold transition",
                role === "ADMIN" ? "bg-white text-ink shadow-card" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Shield className="h-4 w-4" /> Admin
            </button>
          </div>

          <p className="mb-4 rounded-lg bg-brand-50 px-3 py-2 text-center text-xs font-medium text-brand-700">
            {role === "STUDENT"
              ? "Logging in as a student or commissioner."
              : "Admin access only — for USG officers and system administrators."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">CSU Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === "ADMIN" ? "admin@carsu.edu.ph" : "youremail@carsu.edu.ph"}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input pr-11"
                  required
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
              {loading ? "Signing in…" : `Login as ${role === "STUDENT" ? "Student" : "Admin"}`}
            </button>

            <p className="text-center">
              <Link href="/forgot-password" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Forgot Password?</Link>
            </p>
          </form>

          {role === "STUDENT" && (
            <>
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-500">Don&apos;t have an account yet?</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <Link href="/register" className="btn-outline w-full !py-3">Register</Link>
            </>
          )}
        </div>
      </div>

      <p className="pb-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} CarsuComits · Caraga State University</p>
    </main>
  );
}
