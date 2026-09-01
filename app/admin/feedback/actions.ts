"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const statuses = new Set(["new", "reviewed", "resolved"]);

export async function updateFeedbackStatus(id: string, status: string) {
  if (!statuses.has(status)) return { error: "Invalid status." };
  const supabase = await createClient();
  const { error } = await supabase.from("feedback_submissions").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/feedback"); return {};
}

export async function deleteFeedback(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("feedback_submissions").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/feedback"); return {};
}
