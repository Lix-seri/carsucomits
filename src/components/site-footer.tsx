import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-3">
            <div className="text-white"><Logo /></div>
            <p className="text-sm text-slate-400">
              Caraga State University&apos;s trusted marketplace for student commissions and services.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/browse" className="hover:text-white">Browse Commissions</Link></li>
              <li><Link href="/post" className="hover:text-white">Post a Task</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white">How It Works</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link href="/safety" className="hover:text-white">Safety Guidelines</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Caraga State University</h4>
            <p className="text-sm leading-6 text-slate-400">
              Ampayon, Butuan City<br />Agusan del Norte, Philippines
            </p>
            <p className="mt-3 text-sm text-slate-400">Official student marketplace</p>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} CarsuComits. All rights reserved. Powered by CSU Students.
        </div>
      </div>
    </footer>
  );
}
