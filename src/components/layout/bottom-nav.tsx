"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Home, MessageCircle, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/browse", label: "Browse", icon: Search },
  { href: "/hiring/post", label: "Post", icon: Plus, primary: true },
  { href: "/hub", label: "My hub", icon: Briefcase },
  { href: "/messages", label: "Messages", icon: MessageCircle },
];

/** Phones: the five places students go most, in thumb reach. Post is the raised centre button. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Quick" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {ITEMS.map(({ href, label, icon: Icon, primary }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href + "/"));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("flex flex-col items-center gap-0.5 py-2 text-xs font-semibold", active ? "text-brand-700" : "text-muted")}
              >
                {primary ? (
                  <span className="-mt-6 grid h-12 w-12 place-items-center rounded-2xl bg-gold-400 text-on-gold shadow-lift ring-4 ring-surface transition active:scale-95">
                    <Icon aria-hidden className="h-6 w-6" strokeWidth={2.6} />
                  </span>
                ) : (
                  <Icon aria-hidden className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                )}
                {label}
                {active && !primary && <span aria-hidden className="h-1 w-6 rounded-full bg-brand-500" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
