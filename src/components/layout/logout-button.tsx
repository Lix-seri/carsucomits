"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoutButton({
  className, label = "Logout", showIcon = true, redirectTo = "/login",
}: {
  className?: string; label?: string; showIcon?: boolean; redirectTo?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore — even if it fails, push them to login
    }
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className={cn(
        "inline-flex items-center gap-2 transition disabled:opacity-50",
        className
      )}
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {busy ? "Logging out…" : label}
    </button>
  );
}
