import { getSession } from "@/lib/session";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SignedInShell } from "../_signed-in-shell";

/** Browse, commission pages and public profiles: inside the app for signed-in students, public chrome otherwise. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session && session.role !== "ADMIN") return <SignedInShell session={session}>{children}</SignedInShell>;
  return (
    <>
      <SiteHeader />
      <main id="main" className="min-h-screen px-4 py-8 sm:px-6 sm:py-10">{children}</main>
      <SiteFooter />
    </>
  );
}
