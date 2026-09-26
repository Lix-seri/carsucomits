"use client";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { ConfirmButton } from "@/components/ui/confirm-button";

export function WithdrawButton({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  return (
    <ConfirmButton
      title="Withdraw your application?"
      message="You can apply again later while the commission is still open."
      confirmLabel="Withdraw"
      danger
      onConfirm={async () => {
        const res = await api(`/api/applications/${applicationId}/withdraw`, { method: "POST" });
        if (!res.ok) return res.error;
        router.refresh();
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-danger-100 bg-surface px-4 py-2 text-sm font-semibold text-danger-600 hover:bg-danger-50"
    >
      <X className="h-4 w-4" /> Withdraw application
    </ConfirmButton>
  );
}
