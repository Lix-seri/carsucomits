"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, User, MessageCircle, Flag, Building2, Shield, Bookmark } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/layout/logout-button";
import { cn } from "@/lib/utils";
import { ROLE_LABEL } from "@/lib/labels";

const MAIN = [
  { href: "/dashboard", label: "Home Feed", icon: Home },
  { href: "/hub", label: "My Hub", icon: Briefcase },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/profile", label: "My Profile", icon: User },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/reports", label: "Reports", icon: Flag, danger: true },
];

export function DashboardSidebar({
  user,
}: {
  user: { fullName: string; avatarUrl: string | null; role: string };
}) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  const QUICK = [
    { href: "/commissioner", label: "Commissioner View", icon: Building2 },
    ...(user.role === "ADMIN" ? [{ href: "/admin", label: "Admin Panel", icon: Shield }] : []),
  ];

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-line bg-white">
      <div className="border-b border-line px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 text-sm font-bold text-white">CC</span>
          <div>
            <p className="text-sm font-bold leading-tight">CarsuComits</p>
            <p className="text-xs text-muted">CSU Marketplace</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-muted">Menu</p>
        <ul className="space-y-1">
          {MAIN.map(({ href, label, icon: Icon, danger }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive(href)
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink hover:bg-sunken",
                  danger && !isActive(href) && "text-danger-600"
                )}
              >
                <Icon className={cn("h-5 w-5", danger && !isActive(href) && "text-danger-500")} />
                {label}
                {isActive(href) && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />}
              </Link>
            </li>
          ))}
        </ul>

        {QUICK.length > 0 && (
          <>
            <p className="mt-6 px-3 pb-2 text-xs font-bold uppercase tracking-wider text-muted">Quick Links</p>
            <ul className="space-y-1">
              {QUICK.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                      isActive(href) ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-sunken"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      <div className="border-t border-line px-3 py-4">
        <Link href="/profile" className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-sunken">
          <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.fullName}</p>
            <p className="text-xs text-muted">{ROLE_LABEL[user.role] ?? "Member"}</p>
          </div>
        </Link>
        <LogoutButton className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-danger-600 hover:bg-danger-50" />
      </div>
    </aside>
  );
}
