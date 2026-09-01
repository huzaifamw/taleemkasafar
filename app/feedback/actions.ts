"use server";

import { createClient } from "@/lib/supabase/server";

export type FeedbackState = { success: boolean; error: string | null };

export async function submitFeedbackAction(_previous: FeedbackState, form: FormData): Promise<FeedbackState> {
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const message = String(form.get("message") ?? "").trim();
  if (name.length < 2 || name.length > 100) return { success: false, error: "Please enter your name." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) return { success: false, error: "Please enter a valid email address." };
  if (message.length < 20 || message.length > 2000) return { success: false, error: "Feedback must be between 20 and 2,000 characters." };
  const supabase = await createClient();
  const { data: submissionId, error } = await supabase.rpc("submit_feedback", { p_name: name, p_email: email, p_message: message });
  if (error) return { success: false, error: error.message.includes("Too many") ? "You have sent several messages recently. Please try again in an hour." : "We could not send your feedback. Please try again." };
  if (!submissionId) return { success: false, error: "We could not confirm your submission. Please try again." };
  return { success: true, error: null };
}
