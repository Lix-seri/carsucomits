import { pageSession } from "@/lib/session";
import { MessagesView } from "@/features/messages/messages-view";

export default async function MessagesPage() {
  await pageSession();
  return <MessagesView />;
}
