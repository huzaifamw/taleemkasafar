"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SettingsState = { success: boolean; error: string | null };

export async function updateProfileAction(_previous: SettingsState, form: FormData): Promise<SettingsState> {
  const displayName = String(form.get("display_name") ?? "").trim();
  if (displayName.length < 2 || displayName.length > 60) return { success: false, error: "Name must be between 2 and 60 characters." };
  if (!/^[\p{L}\p{M} .'-]+$/u.test(displayName)) return { success: false, error: "Name contains unsupported characters." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Please sign in again." };
  const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);
  if (error) return { success: false, error: "We could not update your profile. Please try again." };
  await supabase.auth.updateUser({ data: { full_name: displayName, display_name: displayName } });
  revalidatePath("/dashboard", "layout"); revalidatePath("/settings");
  return { success: true, error: null };
}
