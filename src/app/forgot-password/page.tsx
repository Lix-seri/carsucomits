"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Logo } from "@/components/logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.endsWith("@carsu.edu.ph")) { setError("Use your @carsu.edu.ph email."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSent(true);
      else setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-brand-50/40">
      <Link href="/login" className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to Login
      </Link>

      <div className="grid min-h-screen place-items-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <div className="mb-6 flex flex-col items-center text-center">
            <Logo />
            <h1 className="mt-5 text-2xl font-bold">Forgot password?</h1>
            <p className="mt-1 text-sm text-slate-500">We&apos;ll send you a link to reset it.</p>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <Mail className="h-6 w-6" />
              </div>
              <p className="text-sm text-slate-700">
                If <strong>{email}</strong> is registered, a reset link has been sent. Check your inbox.
              </p>
              <p className="mt-4 text-xs text-slate-500">The link expires in 1 hour.</p>
              <Link href="/login" className="btn-outline mt-6 inline-block w-full !py-3">
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">CSU Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="youremail@carsu.edu.ph"
                  className="input"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
