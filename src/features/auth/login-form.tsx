"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, GraduationCap, Shield } from "lucide-react";
import { Field, FormError } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { homeFor, safeNextPath } from "@/lib/redirect";

type LoginRole = "STUDENT" | "ADMIN";

export function LoginForm() {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const [role, setRole] = useState<LoginRole>("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [needMfa, setNeedMfa] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function attemptLogin(payload: Record<string, string>) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { res, data: await res.json() };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEmailError(null);
    if (!email.trim().toLowerCase().endsWith("@carsu.edu.ph")) {
      setEmailError("Use your @carsu.edu.ph email address.");
      return;
    }
    setLoading(true);
    try {
      const { res, data } = await attemptLogin({ email, password, expectedRole: role });
      if (data.mfaRequired && !data.ok) {
        setNeedMfa(true);
        return;
      }
      if (!res.ok) { setError(data.error ?? "Login failed."); return; }
      const dest = next ?? homeFor(data.user?.role ?? "");
      router.replace(dest);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { res, data } = await attemptLogin({ email, password, expectedRole: role, mfaCode });
      if (!res.ok) { setError(data.error ?? "Code rejected."); return; }
      const dest = next ?? homeFor(data.user?.role ?? "");
      router.replace(dest);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main id="main" className="flex min-h-screen flex-col">
      <Link href="/" className="m-4 inline-flex items-center gap-1.5 self-start rounded-lg px-2 py-1 text-sm font-medium text-muted hover:text-ink sm:m-6">
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>

      <div className="grid flex-1 place-items-center px-4 pb-10">
        <div className="w-full max-w-md rounded-xl border border-line bg-white p-6 shadow-card sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <Logo />
            <h1 className="mt-5 text-2xl font-bold">{needMfa ? "Two-factor sign-in" : "Sign in"}</h1>
            <p className="mt-1 text-sm text-muted">
              {needMfa
                ? "Enter the 6-digit code from your authenticator app."
                : "Use your @carsu.edu.ph account."}
            </p>
          </div>

          {needMfa ? (
            <form noValidate onSubmit={handleMfaSubmit} className="space-y-4">
                            <Field label="6-digit code (or backup code)">
                <input
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="123456"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  className="input text-center text-2xl tracking-code"
                />
              </Field>
              <FormError message={error} />
              <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
                {loading ? "Verifying…" : "Verify and sign in"}
              </button>
              <button
                type="button"
                onClick={() => { setNeedMfa(false); setMfaCode(""); setError(null); }}
                className="w-full text-center text-sm font-semibold text-muted hover:text-ink"
              >
                Use a different account
              </button>
            </form>
          ) : (
            <>
              <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-sunken p-1">
                <button
                  type="button"
                  aria-pressed={role === "STUDENT"}
                  onClick={() => setRole("STUDENT")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-semibold transition",
                    role === "STUDENT" ? "bg-white text-ink shadow-card" : "text-muted hover:text-ink",
                  )}
                >
                  <GraduationCap className="h-4 w-4" /> Student
                </button>
                <button
                  type="button"
                  aria-pressed={role === "ADMIN"}
                  onClick={() => setRole("ADMIN")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-semibold transition",
                    role === "ADMIN" ? "bg-white text-ink shadow-card" : "text-muted hover:text-ink",
                  )}
                >
                  <Shield className="h-4 w-4" /> Admin
                </button>
              </div>

              {role === "ADMIN" && (
                <p className="mb-4 text-center text-xs text-muted">For admins and USED officers.</p>
              )}

              <form noValidate onSubmit={handleSubmit} className="space-y-4">
                <Field label="CSU email address" error={emailError}>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === "ADMIN" ? "admin@carsu.edu.ph" : "youremail@carsu.edu.ph"}
                    className="input"
                  />
                </Field>
                <Field label="Password">
                  <PasswordInput
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </Field>

                <FormError message={error} />

                <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
                  {loading ? "Signing in…" : `Sign in as ${role === "STUDENT" ? "Student" : "Admin"}`}
                </button>
              </form>

              {role === "STUDENT" && (
                <p className="mt-6 text-center text-sm text-muted">
                  New to CarsuComits? <Link href="/register" className="font-semibold text-brand-700 hover:underline">Create an account</Link>
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <p className="pb-6 text-center text-xs text-muted">CarsuComits · Caraga State University – Main Campus</p>
    </main>
  );
}
