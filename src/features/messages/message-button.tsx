"use client";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function MessageButton({ userId }: { userId: string }) {
  return (
    <Link
      href={`/messages?with=${userId}`}
      className="btn-outline"
    >
      <MessageCircle className="h-4 w-4" /> Message
    </Link>
  );
}
