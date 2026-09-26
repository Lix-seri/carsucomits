import Link from "next/link";
import { Logo } from "./logo";

const COLUMNS = [
  {
    title: "The board",
    links: [
      { href: "/browse", label: "Browse commissions" },
      { href: "/hiring/post", label: "Post a commission" },
      { href: "/#how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Trust and rules",
    links: [
      { href: "/about", label: "About and safety" },
      { href: "/terms", label: "Terms of use" },
      { href: "/terms#academic-work", label: "Academic work rule" },
    ],
  },
  {
    title: "Your account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create an account" },
      { href: "/verify", label: "CCIS verification" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-5">
        <div className="space-y-3 md:col-span-2">
          <Logo size="sm" />
          <p className="max-w-xs text-sm text-muted">
            Students helping students at Caraga State University – Main Campus, Ampayon, Butuan City.
          </p>
        </div>
        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="font-display text-sm font-bold">{c.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.href}><Link href={l.href} className="text-muted hover:text-ink hover:underline">{l.label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="mx-auto max-w-7xl border-t border-line px-4 py-5 text-xs text-muted sm:px-6">
        © {new Date().getFullYear()} CarSUComits · Built by CSU Main students · Not an official university site · v{process.env.APP_VERSION}
      </p>
    </footer>
  );
}
