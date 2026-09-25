"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

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
  createdAt: string;
};

type OtherUser = { id: string; fullName: string; avatarUrl: string | null };

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

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

  // Identify "me" from the threads list (we infer it from whichever id appears as "other").
  // For correctness, expose it via /api/notifications response which already runs on login.
  // Easier: stash the session userId in a cookie-readable endpoint. Skipping — we don't need
  // meId for thread display since the API already grouped by other.

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
    } else if (data.error) {
      alert(data.error);
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
        alert(data.error ?? "Failed to send.");
        // Roll back optimistic message
        setMessages((m) => m.filter((x) => x.id !== optimistic.id));
        return;
      }
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
    <div className="grid h-[calc(100vh-7rem)] gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-lg font-bold">Messages</h2>
          <p className="text-xs text-slate-500">Your conversations</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingThreads ? (
            <p className="p-6 text-center text-sm text-slate-500">Loading…</p>
          ) : threads.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              <MessageCircle className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p>No conversations yet.</p>
              <p className="mt-1 text-xs">Click &quot;Message&quot; on any user&apos;s profile to start one.</p>
            </div>
          ) : (
            <ul>
              {threads.map((t) => (
                <li key={t.otherId}>
                  <button
                    onClick={() => pickThread(t.otherId)}
                    className={`flex w-full items-start gap-3 border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${
                      activeId === t.otherId ? "bg-brand-50" : ""
                    }`}
                  >
                    <Avatar name={t.otherName} src={t.otherAvatar} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{t.otherName}</p>
                        <span className="shrink-0 text-[10px] text-slate-400">{timeAgo(t.lastAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs text-slate-500">
                          {t.lastFromMe && <span className="text-slate-400">You: </span>}
                          {t.lastBody}
                        </p>
                        {t.unread > 0 && (
                          <span className="shrink-0 rounded-full bg-brand-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
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

      <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {!activeId ? (
          <div className="grid flex-1 place-items-center px-6 text-center">
            <div>
              <MessageCircle className="mx-auto mb-2 h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-500">Select a conversation to start chatting.</p>
            </div>
          </div>
        ) : !other ? (
          <p className="p-6 text-center text-sm text-slate-500">
            {loadingMessages ? "Loading conversation…" : "Conversation not available."}
          </p>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-brand-500 to-brand-600 p-4 text-white">
              <button onClick={() => setActiveId(null)} className="rounded-full p-1 hover:bg-white/20 lg:hidden">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <Avatar name={other.fullName} src={other.avatarUrl} size="sm" />
              <div>
                <p className="font-semibold">{other.fullName}</p>
                <p className="text-xs text-white/85">CSU Marketplace member</p>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-500">
                  No messages yet. Send the first one!
                </p>
              ) : (
                messages.map((m) => {
                  const fromOther = m.senderId === other.id;
                  return (
                    <div key={m.id} className={`flex ${fromOther ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                          fromOther ? "bg-slate-100 text-ink" : "bg-brand-500 text-white"
                        }`}
                      >
                        {m.body}
                        <p className={`mt-0.5 text-[10px] ${fromOther ? "text-slate-400" : "text-white/70"}`}>
                          {timeAgo(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-100 p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                className="input flex-1"
                disabled={sending}
              />
              <button type="submit" disabled={sending || !draft.trim()} className="btn-primary !py-2.5 disabled:opacity-50">
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
    <Suspense fallback={<p className="p-6 text-center text-sm text-slate-500">Loading messages…</p>}>
      <MessagesViewInner />
    </Suspense>
  );
}
