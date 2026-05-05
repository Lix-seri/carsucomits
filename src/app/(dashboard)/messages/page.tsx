"use client";
import { useState } from "react";
import { Send, ArrowLeft } from "lucide-react";

const THREADS = [
  { id: "t1", name: "CJ Godwin Casera", initials: "CJ", last: "Hey Glen, got a minute?", time: "2m ago", color: "bg-blue-500" },
  { id: "t2", name: "Glen Francis Licayan", initials: "GL", last: "Hi Jef, are you willing to layout a post?", time: "15m ago", color: "bg-blue-500" },
  { id: "t3", name: "Maria Santos", initials: "MS", last: "Calculus session went well!", time: "1h ago", color: "bg-pink-500" },
];

const MESSAGES: Record<string, { from: "me" | "them"; text: string }[]> = {
  t1: [
    { from: "them", text: "Hey Glen, can you get this done by Saturday?" },
    { from: "me", text: "Sure, let's chat!" },
  ],
  t2: [{ from: "them", text: "Hi Jef, are you willing to layout a post?" }],
  t3: [{ from: "them", text: "Calculus session went well!" }],
};

export default function MessagesPage() {
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const thread = THREADS.find((t) => t.id === active);

  return (
    <div className="grid h-[calc(100vh-7rem)] gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-lg font-bold">Messages</h2>
          <p className="text-xs text-slate-500">Your conversations</p>
        </div>
        <ul className="overflow-y-auto">
          {THREADS.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => setActive(t.id)}
                className={`flex w-full items-start gap-3 border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${active === t.id ? "bg-brand-50" : ""}`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${t.color}`}>{t.initials}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{t.name}</p>
                    <span className="shrink-0 text-[10px] text-slate-400">{t.time}</span>
                  </div>
                  <p className="truncate text-xs italic text-slate-500">&quot;{t.last}&quot;</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {!thread ? (
          <div className="grid flex-1 place-items-center text-sm text-slate-500">
            Select a conversation to start chatting.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-brand-500 to-brand-600 p-4 text-white">
              <button onClick={() => setActive(null)} className="rounded-full p-1 hover:bg-white/20 lg:hidden"><ArrowLeft className="h-4 w-4" /></button>
              <div>
                <p className="font-semibold">Conversation</p>
                <p className="text-xs text-white/85">Chat with {thread.name}</p>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {MESSAGES[thread.id].map((m, i) => (
                <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${m.from === "me" ? "bg-brand-500 text-white" : "bg-slate-100 text-ink"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); setDraft(""); }}
              className="flex items-center gap-2 border-t border-slate-100 p-3"
            >
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message…" className="input flex-1" />
              <button className="btn-primary !py-2.5"><Send className="h-4 w-4" /></button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
