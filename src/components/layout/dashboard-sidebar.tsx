"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, Bookmark, Briefcase, Flag, Home, Megaphone, MessageCircle, Receipt, Search, User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/layout/logout-button";
import { cn } from "@/lib/utils";
import { ROLE_LABEL } from "@/lib/labels";

const GROUPS = [
  {
    label: "Work",
    items: [
      { href: "/dashboard", label: "Home", icon: Home },
      { href: "/browse", label: "Browse", icon: Search },
      { href: "/hub", label: "My hub", icon: Briefcase },
      { href: "/hiring", label: "Hiring", icon: Megaphone },
      { href: "/messages", label: "Messages", icon: MessageCircle },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/saved", label: "Saved", icon: Bookmark },
      { href: "/transactions", label: "Transactions", icon: Receipt },
      { href: "/profile", label: "Profile", icon: User },
      { href: "/verify", label: "Verification", icon: BadgeCheck },
      { href: "/reports", label: "Reports", icon: Flag },
    ],
  },
];

export function DashboardSidebar({ user }: { user: { fullName: string; avatarUrl: string | null; role: string } }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-line bg-surface">
      <Link href="/dashboard" className="flex items-center gap-2.5 border-b border-line px-5 py-4">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 text-sm font-bold text-white">CC</span>
        <span>
          <span className="block text-sm font-semibold leading-tight">CarSUComits</span>
          <span className="block text-xs text-muted">CSU Main marketplace</span>
        </span>
      </Link>

      <nav aria-label="Main" className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {GROUPS.map((g) => (
          <div key={g.label}>
            <p className="px-3 pb-1.5 text-xs font-semibold text-muted">{g.label}</p>
            <ul className="space-y-0.5">
              {g.items.map(({ href, label, icon: Icon }) => (
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
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-3 py-4">
        <Link href="/profile" className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-sunken">
          <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{user.fullName}</span>
            <span className="block text-xs text-muted">{ROLE_LABEL[user.role] ?? "Member"}</span>
          </span>
        </Link>
        <LogoutButton className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-sunken hover:text-ink" />
      </div>
    </aside>
  );
}
