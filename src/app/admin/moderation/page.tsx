import { pageSession } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { listFlags, listWords } from "@/features/moderation/server";
import { FlagQueue } from "@/features/moderation/flag-queue";
import { WordList } from "@/features/moderation/word-list";

export const metadata = { title: "Content review" };

export default async function AdminModeration() {
  const session = await pageSession({ admin: true });
  const [{ flags }, { words }] = await Promise.all([listFlags(session), listWords(session)]);
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <PageHeader
        title="Content review"
        description="Text that matched the word list. Flagged commissions and messages stay hidden until you approve them; cover letters and skills stay up until you remove them."
      />
      <section aria-labelledby="queue">
        <h2 id="queue" className="mb-3 flex items-center gap-2 text-lg font-semibold">
          Waiting for review <span className="tabular text-sm font-medium text-muted">{flags.length}</span>
        </h2>
        <FlagQueue flags={flags.map((f) => ({ ...f, createdAt: f.createdAt.toISOString() }))} />
      </section>
      <section aria-labelledby="words">
        <h2 id="words" className="mb-3 text-lg font-semibold">Word list</h2>
        <WordList words={words} />
      </section>
    </div>
  );
}
