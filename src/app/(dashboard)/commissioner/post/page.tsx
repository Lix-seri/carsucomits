import { pageSession } from "@/lib/session";
import { PostCommissionForm } from "@/features/commissions/post-commission-form";

export default async function PostCommissionPage() {
  await pageSession();
  return <PostCommissionForm />;
}
