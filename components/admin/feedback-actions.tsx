"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteFeedback, updateFeedbackStatus } from "@/app/admin/feedback/actions";

export function FeedbackActions({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition(); const router = useRouter();
  const run = (action: () => Promise<{ error?: string }>) => startTransition(async () => { const result = await action(); if (result.error) window.alert(result.error); else router.refresh(); });
  return <div className="flex items-center gap-2"><label className="sr-only" htmlFor={`status-${id}`}>Feedback status</label><select id={`status-${id}`} value={status} disabled={pending} onChange={(event) => run(() => updateFeedbackStatus(id, event.target.value))} className="border-2 border-black bg-white px-2 py-2 text-xs font-bold uppercase outline-none"><option value="new">New</option><option value="reviewed">Reviewed</option><option value="resolved">Resolved</option></select><button type="button" disabled={pending} onClick={() => { if (window.confirm("Permanently delete this feedback?")) run(() => deleteFeedback(id)); }} className="border-2 border-black bg-white p-2 text-danger hover:bg-danger hover:text-white" aria-label="Delete feedback"><span className="material-symbols-outlined text-lg">delete</span></button></div>;
}
