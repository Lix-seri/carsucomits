import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Tisa } from "@/components/illustrations/tisa";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="paper-dots mx-auto flex max-w-xl flex-col items-center px-6 py-16 text-center">
        <Tisa pose="lost" className="h-40 w-40" label="Tisa the chalk mascot, looking lost" />
        <p className="mt-4 font-chalk text-2xl text-brand-700">404</p>
        <h1 className="display mt-1 text-4xl">This slip fell off the board</h1>
        <p className="mt-3 text-muted">The link may be old, or the commission or profile was taken down.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/browse" className="btn-primary">Browse the board</Link>
          <Link href="/" className="btn-secondary">Go home</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
