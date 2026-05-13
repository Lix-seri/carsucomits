"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, ClipboardList, AlertTriangle, FileText, Settings, ShieldCheck } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/listings", label: "All Listings", icon: ClipboardList },
  { href: "/admin/reports", label: "Reports & Flags", icon: AlertTriangle },
  { href: "/admin/logs", label: "System Logs", icon: FileText },
  { href: "/admin/security", label: "Security (MFA)", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 text-sm font-bold text-white">CC</span>
          <span className="text-base font-bold">CarsuComits</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname?.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500 text-xs font-bold text-white">AU</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Admin USG</p>
            <p className="text-xs text-slate-500">System Administrator</p>
          </div>
        </div>
        <LogoutButton className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50" />

      </div>
    </aside>
  );
}
