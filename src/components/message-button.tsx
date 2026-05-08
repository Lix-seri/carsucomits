"use client";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function MessageButton({ userId }: { userId: string }) {
  return (
    <Link
      href={`/messages?with=${userId}`}
      className="inline-flex items-center gap-2 rounded-lg border-2 border-brand-500 px-4 py-2 text-sm font-semibold text-brand-500 transition hover:bg-brand-50"
    >
      <MessageCircle className="h-4 w-4" /> Message
    </Link>
  );
}
