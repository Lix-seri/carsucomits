"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { Field, FormError } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { Logo } from "@/components/layout/logo";

export function RegisterForm() {
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
    window.location.assign("/dashboard"); // full load: the new session changes every page
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
            <h1 className="mt-5 text-2xl font-bold">Create your account</h1>
            <p className="mt-1 text-sm text-muted">For CSU Main students with an @carsu.edu.ph email.</p>
          </div>

          <form noValidate onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full name" error={errorFor("fullName")}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Dela Cruz" autoComplete="name" className="input" />
            </Field>
            <Field label="Email (@carsu.edu.ph)" error={errorFor("email")}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="yourname@carsu.edu.ph" autoComplete="email" className="input" />
            </Field>
            <Field label="Password" error={errorFor("password")} hint="At least 8 characters.">
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" autoComplete="new-password" />
            </Field>
            <Field label="Confirm password" error={errorFor("confirm")}>
              <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter your password" autoComplete="new-password" />
            </Field>

            <FormError message={error && !["fullName", "email", "password", "confirm"].includes(error.field ?? "") ? error.message : null} />

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
              {loading ? "Creating account…" : "Create account"}
            </button>

            <p className="text-center text-sm text-muted">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-brand-700 hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>

      <p className="pb-6 text-center text-xs text-muted">CarsuComits · Caraga State University – Main Campus</p>
    </main>
  );
}
