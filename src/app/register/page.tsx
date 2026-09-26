import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { homeFor } from "@/lib/redirect";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect(homeFor(session.role));
  return <RegisterForm />;
}
