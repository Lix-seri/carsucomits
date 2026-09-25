/* eslint-disable no-restricted-syntax -- design literals predate src/styles/tokens.ts; remove this line when the file is redesigned (Phase 4). */
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Logo } from "./logo";
import { Avatar } from "@/components/ui/avatar";
import { LogoutButton } from "./logout-button";
import { getSession } from "@/lib/session";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse Commissions" },
  { href: "/about", label: "About" },
  { href: "/help", label: "Help" },
];

export async function SiteHeader() {
  const session = await getSession();
  const dashHref = session?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm font-medium text-slate-700 hover:text-brand-500">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link href={dashHref} className="hidden items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-brand-600 sm:inline-flex">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link href={dashHref} className="flex items-center gap-2 rounded-full bg-brand-50 px-2 py-1 pr-3 hover:bg-brand-100">
                <Avatar name={session.fullName} src={session.avatarUrl} size="xs" />
                <span className="text-sm font-semibold text-brand-700">{session.fullName.split(" ")[0]}</span>
              </Link>
              <LogoutButton className="text-sm font-medium text-slate-500 hover:text-red-600" showIcon={false} redirectTo="/" />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-brand-500 hover:text-brand-600">Login</Link>
              <Link href="/register" className="btn-primary !py-2">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
