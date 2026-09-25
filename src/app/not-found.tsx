import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">404</p>
        <h1 className="mt-2 text-3xl font-bold">We couldn&apos;t find that page</h1>
        <p className="mt-3 text-muted">
          The link may be old, or the commission or profile may have been removed.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/browse" className="btn-primary">Browse commissions</Link>
          <Link href="/" className="btn-outline">Go home</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
