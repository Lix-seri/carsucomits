"use client";
import { X } from "lucide-react";
import { useEffect } from "react";

export function ModalShell({
  title, subtitle, onClose, children, headerClass = "bg-brand-500", maxWidth = "max-w-md",
}: {
  title: string; subtitle?: string; onClose: () => void; children: React.ReactNode;
  headerClass?: string; maxWidth?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className={`w-full ${maxWidth} overflow-hidden rounded-2xl bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-start justify-between px-5 py-4 text-white ${headerClass}`}>
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            {subtitle && <p className="text-sm text-white/85">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-full bg-white/20 p-1.5 hover:bg-white/30">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
