"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Flag, Home, ScrollText, Settings, ShieldCheck, Users } from "lucide-react";
import { LogoutButton } from "@/components/layout/logout-button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: Home },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Commissions", icon: ClipboardList },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/logs", label: "Activity log", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/security", label: "Security", icon: ShieldCheck },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || (href !== "/admin" && pathname?.startsWith(href));
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-line bg-white">
      <Link href="/admin" className="flex items-center gap-2.5 border-b border-line px-5 py-4">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-sm font-bold text-white">CC</span>
        <span>
          <span className="block text-sm font-semibold leading-tight">CarsuComits</span>
          <span className="block text-xs text-muted">Admin panel</span>
        </span>
      </Link>
      <nav aria-label="Admin" className="flex-1 px-3 py-4">
        <ul className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(href) ? "bg-brand-50 text-brand-800" : "text-ink hover:bg-sunken",
                )}
              >
                <Icon className={cn("h-5 w-5", isActive(href) ? "text-brand-600" : "text-muted")} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-line px-3 py-4">
        <p className="px-2 text-xs text-muted">Signed in as</p>
        <p className="truncate px-2 text-sm font-semibold">{adminName}</p>
        <LogoutButton className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-sunken hover:text-ink" />
      </div>
    </aside>
  );
}
