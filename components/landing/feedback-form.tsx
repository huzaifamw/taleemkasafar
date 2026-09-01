"use client";

import { useActionState } from "react";
import { submitFeedbackAction } from "@/app/feedback/actions";

export function FeedbackForm() {
  const [state, formAction, pending] = useActionState(submitFeedbackAction, { success: false, error: null });

  if (state.success) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center border-2 border-black bg-brand-fixed p-8 text-center shadow-hard">
        <span className="material-symbols-outlined mb-4 text-6xl text-brand">celebration</span>
        <h3 className="font-headline text-3xl font-bold uppercase">Shukriya!</h3>
        <p className="mt-2 max-w-sm font-medium text-on-surface-variant">
          Your feedback has been noted. It helps us make the learning journey better.
        </p>
        <p className="mt-6 border-2 border-black bg-white px-5 py-3 font-headline text-sm font-bold uppercase shadow-hard-sm">Message received</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="border-2 border-black bg-white p-6 shadow-hard md:p-8">
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
      {state.error && <p role="alert" className="mt-4 border-2 border-danger bg-red-50 p-3 text-sm font-medium text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className="mt-5 flex w-full items-center justify-center gap-2 border-2 border-black bg-black px-6 py-4 font-headline text-base font-bold uppercase text-white shadow-hard transition-all hover:bg-brand active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-wait disabled:opacity-60">
        {pending ? "Sending…" : "Send feedback"} <span className="material-symbols-outlined">arrow_outward</span>
      </button>
      <p className="mt-3 text-xs text-on-surface-variant">Your feedback is shared privately with the Taleem ka Safar team.</p>
    </form>
  );
}
