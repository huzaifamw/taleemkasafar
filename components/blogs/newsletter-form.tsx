"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm() {
  const [joined, setJoined] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setJoined(true); }
  if (joined) return <div className="border-2 border-black bg-[#c8f4d4] p-5 font-headline font-bold uppercase shadow-hard-sm">You&apos;re on the list. Fresh study ideas are coming your way.</div>;
  return <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" required placeholder="Your email address" className="min-w-0 flex-1 border-2 border-black bg-white px-4 py-4 text-black outline-none focus:shadow-hard-primary" /><button className="border-2 border-black bg-black px-6 py-4 font-headline text-sm font-bold uppercase text-white shadow-hard-sm transition-all hover:bg-brand active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">Join the newsletter</button></form>;
}
