import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-faint">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-3">
            <div className="text-white"><Logo /></div>
            <p className="text-sm text-muted">
              Caraga State University&apos;s trusted marketplace for student commissions and services.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/browse" className="hover:text-white">Browse Commissions</Link></li>
              <li><Link href="/commissioner/post" className="hover:text-white">Post a Commission</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-white">How It Works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white">Trust &amp; Safety</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Use</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Caraga State University</h4>
            <p className="text-sm leading-6 text-muted">
              Ampayon, Butuan City<br />Agusan del Norte, Philippines
            </p>
            <p className="mt-3 text-sm text-muted">Official student marketplace</p>
          </div>
        </div>
        <div className="mt-12 border-t border-line-strong pt-6 text-center text-sm text-muted">
          © {new Date().getFullYear()} CarsuComits. All rights reserved. Powered by CSU Students. · v{process.env.APP_VERSION}
        </div>
      </div>
    </footer>
  );
}
