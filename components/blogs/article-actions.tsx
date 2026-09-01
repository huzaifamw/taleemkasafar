"use client";

import { useState } from "react";

export function ArticleActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    if (navigator.share) { await navigator.share({ title, url: window.location.href }); return; }
    await navigator.clipboard.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1800);
  }
  return <button type="button" onClick={share} className="flex items-center gap-2 border-2 border-black bg-white px-4 py-3 font-headline text-xs font-bold uppercase shadow-hard-sm transition-all hover:bg-brand-fixed active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"><span className="material-symbols-outlined text-lg">{copied ? "check" : "ios_share"}</span>{copied ? "Link copied" : "Share article"}</button>;
}
