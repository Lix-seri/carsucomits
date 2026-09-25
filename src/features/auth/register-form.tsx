/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { Field, FormError } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { Logo } from "@/components/layout/logo";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  // One error at a time, attached to the field it's about (or the form when field is empty).
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const errorFor = (field: string) => (error?.field === field ? error.message : null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) return setError({ field: "fullName", message: "Enter your full name." });
    if (!email.trim().toLowerCase().endsWith("@carsu.edu.ph")) return setError({ field: "email", message: "Use your @carsu.edu.ph email address." });
    if (password.length < 8) return setError({ field: "password", message: "Password must be at least 8 characters." });
    if (password !== confirm) return setError({ field: "confirm", message: "Passwords don't match." });
    setLoading(true);
    const res = await api("/api/auth/register", { json: { fullName: name, email, password } });
    setLoading(false);
    if (!res.ok) return setError({ field: res.field, message: res.error });
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-brand-50/40">
      <Link href="/" className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="grid min-h-screen place-items-center px-6 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <div className="mb-6 flex flex-col items-center text-center">
            <Logo />
            <h1 className="mt-5 text-2xl font-bold">Create Your Account</h1>
            <p className="mt-1 text-sm text-slate-500">Join the CSU Commission Marketplace</p>
          </div>

          <form noValidate onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full Name" error={errorFor("fullName")}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" autoComplete="name" className="input" />
            </Field>
            <Field label="CSU Email Address" error={errorFor("email")}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="yourname@carsu.edu.ph" autoComplete="email" className="input" />
            </Field>
            <Field label="Password" error={errorFor("password")} hint="At least 8 characters.">
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" autoComplete="new-password" />
            </Field>
            <Field label="Confirm Password" error={errorFor("confirm")}>
              <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter your password" autoComplete="new-password" />
            </Field>

            <FormError message={error && !["fullName", "email", "password", "confirm"].includes(error.field ?? "") ? error.message : null} />

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
              {loading ? "Creating account…" : "Create Account"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">Login</Link>
            </p>
          </form>
        </div>
      </div>

      <p className="pb-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} CarsuComits · Caraga State University</p>
    </main>
  );
}
