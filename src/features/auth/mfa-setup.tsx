"use client";
/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";

type Step = "idle" | "qr" | "verify" | "backup" | "disable";

export function MfaSetup({ initiallyEnabled, email }: { initiallyEnabled: boolean; email: string }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initiallyEnabled);
  const [step, setStep] = useState<Step>("idle");
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startSetup() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/mfa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to start MFA setup."); return; }
      setQr(data.qrDataUrl);
      setSecret(data.secret);
      setStep("qr");
    } finally {
      setBusy(false);
    }
  }

  async function confirmCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/mfa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not enable MFA."); return; }
      setBackupCodes(data.backupCodes);
      setEnabled(true);
      setStep("backup");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function disable(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/mfa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not disable MFA."); return; }
      setEnabled(false);
      setPassword("");
      setStep("idle");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (enabled && step !== "backup" && step !== "disable") {
    return (
      <div className="space-y-3">
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
          <ShieldCheck className="mr-1 inline h-4 w-4" /> MFA is active for <strong>{email}</strong>.
        </p>
        <button onClick={() => setStep("disable")} className="rounded-lg border border-danger-200 bg-white px-4 py-2 text-sm font-semibold text-danger-600 hover:bg-danger-50">
          <ShieldOff className="mr-1 inline h-4 w-4" /> Disable MFA
        </button>
      </div>
    );
  }

  if (step === "disable") {
    return (
      <form noValidate onSubmit={disable} className="space-y-3">
        <p className="text-sm text-muted">Enter your account password to confirm.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Current password"
          aria-label="Current password"
          autoComplete="current-password"
          className="input"
        />
        {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={() => { setStep("idle"); setError(null); }} className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-sunken">Cancel</button>
          <button type="submit" disabled={busy} className="rounded-lg bg-danger-500 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-600 disabled:opacity-50">
            {busy ? "Disabling…" : "Disable MFA"}
          </button>
        </div>
      </form>
    );
  }

  if (step === "backup") {
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold">⚠️ Save these backup codes</p>
        <p className="text-xs text-muted">
          Use any of these to sign in if you lose access to your authenticator app. Each code works once.
          <strong> Save them somewhere safe — they won&apos;t be shown again.</strong>
        </p>
        <ul className="grid grid-cols-2 gap-2 rounded-lg bg-sunken p-4 font-mono text-sm">
          {backupCodes.map((c) => (<li key={c} className="rounded bg-white px-3 py-1.5 text-center">{c}</li>))}
        </ul>
        <button
          onClick={() => navigator.clipboard.writeText(backupCodes.join("\n"))}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-sunken"
        >
          Copy all codes
        </button>
        <button onClick={() => { setStep("idle"); setBackupCodes([]); }} className="btn-primary ml-2">I&apos;ve saved them</button>
      </div>
    );
  }

  if (step === "qr" && qr) {
    return (
      <form noValidate onSubmit={confirmCode} className="space-y-4">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-ink">
          <li>Open your authenticator app (Google Authenticator, Authy, 1Password, etc.).</li>
          <li>Tap &quot;Add account&quot; and scan this QR code:</li>
        </ol>
        <div className="grid place-items-center rounded-xl bg-white p-4">
          <img src={qr} alt="MFA QR code" className="h-48 w-48" />
        </div>
        <details className="rounded-lg bg-sunken px-3 py-2 text-xs text-muted">
          <summary className="cursor-pointer font-semibold">Can&apos;t scan? Enter the secret manually</summary>
          <p className="mt-2 break-all font-mono text-sm">{secret}</p>
        </details>
        <div>
          <label htmlFor="mfa-code" className="label">Enter the 6-digit code from your app</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            id="mfa-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="input text-center text-2xl tracking-code"
            autoFocus
          />
        </div>
        {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={() => { setStep("idle"); setError(null); }} className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-sunken">Cancel</button>
          <button type="submit" disabled={busy} className="btn-primary flex-1">
            {busy ? "Verifying…" : "Verify & Enable"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <button onClick={startSetup} disabled={busy} className="btn-primary">
      {busy ? "Setting up…" : "Enable MFA"}
    </button>
  );
}
