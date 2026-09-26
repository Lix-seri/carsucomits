import Link from "next/link";
import { Logo } from "./logo";

const LINKS = [
  { href: "/browse", label: "Browse commissions" },
  { href: "/hiring/post", label: "Post a commission" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/about", label: "Trust & safety" },
  { href: "/terms", label: "Terms of use" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:justify-between">
        <div className="max-w-sm space-y-3">
          <Logo size="sm" />
          <p className="text-sm text-muted">
            A commission marketplace for students of Caraga State University – Main Campus, Ampayon, Butuan City.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}><Link href={l.href} className="text-muted hover:text-ink">{l.label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="mx-auto max-w-7xl border-t border-line px-4 py-5 text-xs text-muted sm:px-6">
        © {new Date().getFullYear()} CarsuComits · Built by CSU Main students · v{process.env.APP_VERSION}
      </p>
    </footer>
  );
}
