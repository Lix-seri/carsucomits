"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({ fallback = "/browse", label = "Back" }: { fallback?: string; label?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </button>
  );
}
