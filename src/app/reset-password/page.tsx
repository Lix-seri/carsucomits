"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/logo";

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-600">Missing reset token. Use the link from your email.</p>
        <Link href="/forgot-password" className="btn-outline mt-4 inline-block w-full !py-3">Request a new link</Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not reset password."); return; }
      setDone(true);
      setTimeout(() => router.replace("/login"), 2000);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
        <h1 className="text-xl font-bold">Password reset!</h1>
        <p className="mt-2 text-sm text-slate-500">Redirecting you to log in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">New password</label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input pr-11"
            required
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div>
        <label className="label">Confirm new password</label>
        <input
          type={show ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="input"
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
        {loading ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-brand-50/40">
      <Link href="/login" className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to Login
      </Link>

      <div className="grid min-h-screen place-items-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <div className="mb-6 flex flex-col items-center text-center">
            <Logo />
            <h1 className="mt-5 text-2xl font-bold">Choose a new password</h1>
            <p className="mt-1 text-sm text-slate-500">At least 8 characters.</p>
          </div>

          <Suspense fallback={<p className="text-center text-sm text-slate-500">Loading…</p>}>
            <ResetPasswordInner />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
