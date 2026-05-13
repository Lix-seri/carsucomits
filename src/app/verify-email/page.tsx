"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"loading" | "ok" | "already" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setState("error"); setError("Missing token. Use the link from your email."); return; }
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) { setState("error"); setError(data.error ?? "Could not verify."); return; }
        setState(data.alreadyVerified ? "already" : "ok");
      })
      .catch(() => { setState("error"); setError("Network error. Try again."); });
  }, [token]);

  return (
    <main className="min-h-screen bg-brand-50/40">
      <div className="grid min-h-screen place-items-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <div className="mb-6 flex flex-col items-center">
            <Logo />
          </div>

          {state === "loading" && (
            <>
              <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-brand-500" />
              <p className="text-sm text-slate-500">Verifying your email…</p>
            </>
          )}

          {state === "ok" && (
            <>
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
              <h1 className="mb-2 text-xl font-bold">Email verified!</h1>
              <p className="mb-6 text-sm text-slate-500">Your CSU email is now confirmed. You can use the full marketplace.</p>
              <Link href="/dashboard" className="btn-primary w-full">Continue to Dashboard</Link>
            </>
          )}

          {state === "already" && (
            <>
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
              <h1 className="mb-2 text-xl font-bold">Already verified</h1>
              <p className="mb-6 text-sm text-slate-500">This email was already confirmed.</p>
              <Link href="/dashboard" className="btn-primary w-full">Continue to Dashboard</Link>
            </>
          )}

          {state === "error" && (
            <>
              <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-500" />
              <h1 className="mb-2 text-xl font-bold">Verification failed</h1>
              <p className="mb-6 text-sm text-red-600">{error}</p>
              <Link href="/login" className="btn-outline w-full">Back to Login</Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center text-sm text-slate-500">Loading…</p>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
