"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, ClipboardList, Eye, Flag, Home, Receipt, ScrollText, Settings, ShieldCheck, Store, Users } from "lucide-react";
import { LogoutButton } from "@/components/layout/logout-button";
import { Wordmark } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: Home },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/commissions", label: "Commissions", icon: ClipboardList },
  { href: "/admin/transactions", label: "Transactions", icon: Receipt },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/moderation", label: "Content review", icon: Eye },
  { href: "/admin/verifications", label: "Verifications", icon: BadgeCheck },
  { href: "/admin/sellers", label: "Sellers", icon: Store },
  { href: "/admin/logs", label: "Activity log", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/security", label: "Security", icon: ShieldCheck },
];

// USED officers oversee student sellers only (decision 0012).
const USED_NAV = [
  { href: "/used", label: "Sellers", icon: Store },
  { href: "/used/verifications", label: "Verifications", icon: BadgeCheck },
];

/** Sidebar for staff: the full admin panel, or the USED office. */
export function AdminSidebar({ adminName, variant = "admin" }: { adminName: string; variant?: "admin" | "used" }) {
  const pathname = usePathname();
  const home = variant === "used" ? "/used" : "/admin";
  const nav = variant === "used" ? USED_NAV : NAV;
  const isActive = (href: string) => pathname === href || (href !== home && pathname?.startsWith(href));
  return (
    <aside className="board flex h-screen w-60 shrink-0 flex-col border-r border-board-deep">
      <Link href={home} className="flex h-16 flex-col justify-center border-b border-board-chalk/15 px-5">
        <Wordmark size="sm" onDark />
        <span className="mt-0.5 pl-9 text-xs text-board-dust">{variant === "used" ? "USED office" : "Admin panel"}</span>
      </Link>
      <nav aria-label={variant === "used" ? "USED office" : "Admin"} className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(href) ? "bg-board-chalk text-board" : "text-board-chalk hover:bg-board-chalk/10",
                )}
              >
                <Icon aria-hidden className={cn("h-5 w-5", isActive(href) ? "text-board" : "text-board-dust")} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-board-chalk/15 px-3 py-4">
        <p className="px-2 text-xs text-board-dust">Signed in as</p>
        <p className="truncate px-2 text-sm font-semibold text-board-chalk">{adminName}</p>
        <LogoutButton className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-board-dust hover:bg-board-chalk/10 hover:text-board-chalk" />
      </div>
    </aside>
  );
}
