"use client";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ConfirmButton } from "@/components/ui/confirm-button";

/** Admin: give or take away the USED officer role. The server audit-logs the change. */
export function RoleButton({ userId, userName, role }: { userId: string; userName: string; role: string }) {
  const router = useRouter();
  const isUsed = role === "USED";
  return (
    <ConfirmButton
      className="btn-ghost btn-sm"
      title={isUsed ? `Remove ${userName} from the USED office?` : `Make ${userName} a USED officer?`}
      message={
        isUsed
          ? "They go back to a regular student account and lose access to the USED office."
          : "They can review CCIS verifications and suspend or reinstate student sellers. They can't moderate accounts or see the activity log."
      }
      confirmLabel={isUsed ? "Remove USED role" : "Make USED officer"}
      onConfirm={async () => {
        const res = await api(`/api/admin/users/${userId}/role`, { json: { role: isUsed ? "STUDENT_EMPLOYEE" : "USED" } });
        if (!res.ok) return res.error;
        router.refresh();
      }}
    >
      {isUsed ? "Remove USED role" : "Make USED officer"}
    </ConfirmButton>
  );
}
