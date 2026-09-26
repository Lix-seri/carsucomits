import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { homeFor } from "@/lib/redirect";
import { LoginForm } from "@/features/auth/login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(homeFor(session.role));
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
