import Link from "next/link";
import { Search, Star, Users } from "lucide-react";
import { pageSession } from "@/lib/session";
import { ACCOUNT_STATUS, ROLE_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { AccountStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { listUsers } from "@/features/admin/server";
import { ModerateButton } from "@/features/admin/moderate-button";
import { RoleButton } from "@/features/admin/role-button";

export const metadata = { title: "Users" };

export default async function ManageUsers({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q, status } = await searchParams;
  const search = (q ?? "").trim();
  const session = await pageSession({ admin: true });
  const { users, avgMap } = await listUsers(session, search, status);
  const filters = [["", "All"], ...Object.entries(ACCOUNT_STATUS).map(([k, v]) => [k, v.label])];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Users" description="Search, filter and moderate student accounts." />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
          {filters.map(([value, label]) => {
            const active = (status ?? "") === value;
            const href = `/admin/users?${new URLSearchParams({ ...(search ? { q: search } : {}), ...(value ? { status: value } : {}) })}`;
            return (
              <Link
                key={value || "all"}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold", active ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-white hover:border-brand-300")}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <form className="flex w-full items-center gap-2 rounded-lg border border-line bg-white px-3 sm:w-72">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="h-4 w-4 text-faint" />
          <input name="q" defaultValue={search} placeholder="Name or email" aria-label="Search users" className="w-full bg-transparent py-2 text-sm outline-none" />
        </form>
      </div>

      {users.length === 0 ? (
        <EmptyState icon={Users} title="No users match" />
      ) : (
        <div className="rounded-xl border border-line bg-white px-4 sm:px-5">
          <table className="table-stack">
            <thead>
              <tr className="border-b border-line">
                <th>Name</th>
                <th>Role</th>
                <th>Rating</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => {
                const avg = avgMap.get(u.id);
                const canModerate = u.role !== "ADMIN" && u.id !== session.userId;
                return (
                  <tr key={u.id}>
                    <td data-label="">
                      <p className="font-semibold">{u.fullName}</p>
                      <p className="text-xs text-muted">{u.email}</p>
                    </td>
                    <td data-label="Role" className="text-muted">{ROLE_LABEL[u.role] ?? u.role}</td>
                    <td data-label="Rating">
                      {avg != null ? (
                        <span className="inline-flex items-center gap-1 font-semibold">
                          <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" /> {avg.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td data-label="Status"><AccountStatusBadge status={u.status} /></td>
                    <td data-label="" className="text-right">
                      {canModerate && (
                        <div className="flex flex-wrap justify-end gap-2">
                          <RoleButton userId={u.id} userName={u.fullName} role={u.role} />
                          <ModerateButton userId={u.id} userName={u.fullName} status={u.status} />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
