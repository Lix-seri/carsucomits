"use client";
/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Image as ImageIcon, Trash2 } from "lucide-react";

export function CoverImageUploader({
  commissionId,
  initialUrl,
}: { commissionId: string; initialUrl: string | null }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChoose(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/commissions/${commissionId}/cover`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Upload failed."); return; }
      setUrl(data.url);
      router.refresh();
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onRemove() {
    setBusy(true);
    try {
      const res = await fetch(`/api/commissions/${commissionId}/cover`, { method: "DELETE" });
      if (res.ok) { setUrl(null); router.refresh(); }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {url ? (
        <div className="relative overflow-hidden rounded-xl border border-line">
          <img src={url} alt="Cover" className="h-40 w-full object-cover" />
        </div>
      ) : (
        <div className="grid h-40 place-items-center rounded-xl border-2 border-dashed border-line-strong bg-sunken">
          <div className="text-center text-muted">
            <ImageIcon className="mx-auto mb-1 h-8 w-8" />
            <p className="text-sm">No cover image set</p>
          </div>
        </div>
      )}
      <div className="mt-3 flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onChoose}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="btn-outline !py-2"
        >
          {busy ? "Uploading…" : url ? "Replace image" : "Upload cover image"}
        </button>
        {url && !busy && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 rounded-lg border border-danger-200 px-3 py-2 text-sm font-semibold text-danger-600 hover:bg-danger-50"
          >
            <Trash2 className="h-4 w-4" /> Remove
          </button>
        )}
      </div>
      <p className="mt-2 text-xs text-muted">JPG/PNG/WebP up to 5 MB. Shown on browse cards and the commission detail page.</p>
      {error && <p className="mt-2 text-xs text-danger-600">{error}</p>}
    </div>
  );
}
