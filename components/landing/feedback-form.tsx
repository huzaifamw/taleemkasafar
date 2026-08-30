"use client";

import { FormEvent, useState } from "react";

export function FeedbackForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  }

  if (submitted) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center border-2 border-black bg-brand-fixed p-8 text-center shadow-hard">
        <span className="material-symbols-outlined mb-4 text-6xl text-brand">celebration</span>
        <h3 className="font-headline text-3xl font-bold uppercase">Shukriya!</h3>
        <p className="mt-2 max-w-sm font-medium text-on-surface-variant">
          Your feedback has been noted. It helps us make the learning journey better.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 border-2 border-black bg-white px-5 py-3 font-headline text-sm font-bold uppercase shadow-hard-sm transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
        >
          Share another thought
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border-2 border-black bg-white p-6 shadow-hard md:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="font-headline text-xs font-bold uppercase tracking-wider">
          Your name
          <input required name="name" placeholder="Ali Raza" className="mt-2 w-full border-2 border-black p-3 font-body text-base normal-case tracking-normal outline-none focus:border-brand focus:shadow-hard-primary" />
        </label>
        <label className="font-headline text-xs font-bold uppercase tracking-wider">
          Email
          <input required name="email" type="email" placeholder="ali@example.com" className="mt-2 w-full border-2 border-black p-3 font-body text-base normal-case tracking-normal outline-none focus:border-brand focus:shadow-hard-primary" />
        </label>
      </div>
      <label className="mt-5 block font-headline text-xs font-bold uppercase tracking-wider">
        How can we improve?
        <textarea required name="message" rows={4} placeholder="Tell us what would make your preparation easier..." className="mt-2 w-full resize-none border-2 border-black p-3 font-body text-base normal-case tracking-normal outline-none focus:border-brand focus:shadow-hard-primary" />
      </label>
      <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 border-2 border-black bg-black px-6 py-4 font-headline text-base font-bold uppercase text-white shadow-hard transition-all hover:bg-brand active:translate-x-1 active:translate-y-1 active:shadow-none">
        Send feedback <span className="material-symbols-outlined">arrow_outward</span>
      </button>
      <p className="mt-3 text-xs text-on-surface-variant">Demo form — connect it to Supabase when you are ready to store responses.</p>
    </form>
  );
}
