"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, ArrowLeft } from "lucide-react";
import { Tisa } from "@/components/illustrations/tisa";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgoShort } from "@/lib/format";

type Thread = {
  otherId: string;
  otherName: string;
  otherAvatar: string | null;
  lastBody: string;
  lastFromMe: boolean;
  lastAt: string;
  unread: number;
};

type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  readAt: string | null;
  heldForReview?: boolean;
  createdAt: string;
};

type OtherUser = { id: string; fullName: string; avatarUrl: string | null };

function MessagesViewInner() {
  const params = useSearchParams();
  const router = useRouter();
  const initialWith = params.get("with");

  const [meId, setMeId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(initialWith);
  const [other, setOther] = useState<OtherUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [convError, setConvError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const loadThreads = useCallback(async () => {
    const res = await fetch("/api/messages/threads");
    const data = await res.json();
    if (data.ok) setThreads(data.threads);
    setLoadingThreads(false);
  }, []);

  const loadConversation = useCallback(async (otherId: string) => {
    setLoadingMessages(true);
    const res = await fetch(`/api/messages/${otherId}`);
    const data = await res.json();
    if (data.ok) {
      setOther(data.other);
      setMessages(data.messages);
      setConvError(null);
    } else {
      setConvError(data.error ?? "Couldn't load this conversation.");
    }
    setLoadingMessages(false);
  }, []);

  // Initial load.
  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // Poll threads every 10s for new messages and unread updates.
  useEffect(() => {
    const t = setInterval(loadThreads, 10_000);
    return () => clearInterval(t);
  }, [loadThreads]);

  // When the active thread changes, fetch its messages.
  useEffect(() => {
    if (!activeId) { setOther(null); setMessages([]); return; }
    loadConversation(activeId);
  }, [activeId, loadConversation]);

  // Poll active conversation every 5s.
  useEffect(() => {
    if (!activeId) return;
    const t = setInterval(() => loadConversation(activeId), 5_000);
    return () => clearInterval(t);
  }, [activeId, loadConversation]);

  // Auto-scroll on new messages.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // We can derive meId from messages: any senderId we use is "me" if the recipient is "other".
  useEffect(() => {
    if (!other || messages.length === 0) return;
    const sample = messages.find((m) => m.senderId !== other.id || m.recipientId !== other.id);
    if (sample) setMeId(sample.senderId === other.id ? sample.recipientId : sample.senderId);
  }, [other, messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !draft.trim() || sending) return;
    setSending(true);
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      senderId: meId ?? "me",
      recipientId: activeId,
      body: draft.trim(),
      readAt: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    const text = draft.trim();
    setDraft("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: activeId, body: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Roll back the optimistic message and give the text back so nothing is lost.
        setMessages((m) => m.filter((x) => x.id !== optimistic.id));
        setDraft(text);
        setSendError(data.error ?? "Couldn't send. Try again.");
        return;
      }
      // A flagged message is saved but waits for an admin before it's delivered.
      setSendError(data.held ? "Held for review: an admin checks flagged words before this is delivered." : null);
      // Replace optimistic with real one and refresh threads list.
      await loadConversation(activeId);
      loadThreads();
    } finally {
      setSending(false);
    }
  }

  function pickThread(id: string) {
    setActiveId(id);
    const sp = new URLSearchParams(params.toString());
    sp.set("with", id);
    router.replace(`/messages?${sp.toString()}`);
  }

  return (
    <div className="grid h-conversation gap-4 lg:grid-cols-aside-content">
      {/* On phones, one pane at a time: the list, or the open conversation. */}
      <aside className={`${activeId ? "hidden lg:flex" : "flex"} flex-col overflow-hidden rounded-2xl border border-line bg-surface`}>
        <div className="border-b border-line p-4">
          <h1 className="text-lg font-semibold">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingThreads ? (
            <div className="space-y-2 p-4"><Skeleton className="h-14" /><Skeleton className="h-14" /><Skeleton className="h-14" /></div>
          ) : threads.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted">
              <Tisa pose="wave" className="mx-auto h-24 w-24" />
              <p className="font-display text-base font-bold text-ink">No conversations yet</p>
              <p className="mt-1">Open someone&apos;s profile and choose Message to say hi.</p>
            </div>
          ) : (
            <ul>
              {threads.map((t) => (
                <li key={t.otherId}>
                  <button
                    onClick={() => pickThread(t.otherId)}
                    className={`flex w-full items-start gap-3 border-b border-line p-4 text-left transition hover:bg-sunken ${
                      activeId === t.otherId ? "bg-brand-50" : ""
                    }`}
                  >
                    <Avatar name={t.otherName} src={t.otherAvatar} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{t.otherName}</p>
                        <span className="shrink-0 text-xs text-muted">{timeAgoShort(t.lastAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs text-muted">
                          {t.lastFromMe && <span className="text-muted">You: </span>}
                          {t.lastBody}
                        </p>
                        {t.unread > 0 && (
                          <span className="shrink-0 rounded-full bg-brand-500 px-1.5 py-0.5 text-xs font-bold text-white">
                            {t.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <section className={`${activeId ? "flex" : "hidden lg:flex"} flex-col overflow-hidden rounded-2xl border border-line bg-surface`}>
        {!activeId ? (
          <div className="grid flex-1 place-items-center px-6 text-center">
            <div>
              <Tisa pose="hold" className="mx-auto h-28 w-28" />
              <p className="font-display text-lg font-bold">Pick a conversation</p>
              <p className="text-sm text-muted">Your chats with posters and helpers show up on the left.</p>
            </div>
          </div>
        ) : !other ? (
          <p className="p-6 text-center text-sm text-muted">
            {loadingMessages ? "Loading conversation…" : convError ?? "Conversation not available."}
          </p>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-line p-4">
              <button onClick={() => setActiveId(null)} className="rounded-full p-1 text-muted hover:bg-sunken lg:hidden" aria-label="Back to conversations">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <Avatar name={other.fullName} src={other.avatarUrl} size="sm" />
              <div>
                <p className="font-semibold">{other.fullName}</p>
                <Link href={`/u/${other.id}`} className="text-xs text-muted hover:text-brand-700 hover:underline">View profile</Link>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted">
                  No messages yet. Say hello and what you need.
                </p>
              ) : (
                messages.map((m) => {
                  const fromOther = m.senderId === other.id;
                  return (
                    <div key={m.id} className={`flex ${fromOther ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`max-w-bubble rounded-2xl px-4 py-2 text-sm ${
                          fromOther ? "bg-sunken text-ink" : "bg-brand-500 text-white"
                        }`}
                      >
                        {m.body}
                        <p className={`mt-0.5 text-xs ${fromOther ? "text-muted" : "text-white/70"}`}>
                          {m.heldForReview ? "Held for review · not delivered yet" : timeAgoShort(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {sendError && <p role="alert" className="border-t border-line px-3 pt-2 text-xs text-danger-600">{sendError}</p>}
            <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                aria-label="Message"
                className="input flex-1"
                disabled={sending}
              />
              <button type="submit" disabled={sending || !draft.trim()} className="btn-primary !py-2.5 disabled:opacity-50" aria-label="Send message">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

export function MessagesView() {
  return (
    <Suspense fallback={<p className="p-6 text-center text-sm text-muted">Loading messages…</p>}>
      <MessagesViewInner />
    </Suspense>
  );
}
