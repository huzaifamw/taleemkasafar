"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteBlogAction } from "@/app/admin/blogs/actions";

export function DeleteBlogButton({ id, title }: { id: string; title: string }) {
  const [confirming, setConfirming] = useState(false); const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition(); const router = useRouter();
  if (confirming) return <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-danger">Delete permanently?</span><button disabled={pending} onClick={() => startTransition(async () => { const result = await deleteBlogAction(id); if (result.error) setError(result.error); else router.refresh(); })} className="border-2 border-danger bg-danger px-3 py-2 text-xs font-bold uppercase text-white">{pending ? "Deleting…" : "Yes, delete"}</button><button onClick={() => setConfirming(false)} className="border-2 border-black px-3 py-2 text-xs font-bold uppercase">Cancel</button>{error && <span className="w-full text-xs text-danger">{error}</span>}</div>;
  return <button type="button" onClick={() => setConfirming(true)} aria-label={`Delete ${title}`} className="border-2 border-black bg-white p-2 text-danger transition-colors hover:bg-danger hover:text-white"><span className="material-symbols-outlined text-lg">delete</span></button>;
}
