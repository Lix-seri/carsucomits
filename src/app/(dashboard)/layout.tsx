import { redirect } from "next/navigation";
import { pageSession } from "@/lib/session";
import { SignedInShell } from "../_signed-in-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await pageSession();
  // Admins use the Admin Panel; to use the student side they sign in on the Student tab.
  if (session.role === "ADMIN") redirect("/admin");
  return <SignedInShell session={session}>{children}</SignedInShell>;
}
