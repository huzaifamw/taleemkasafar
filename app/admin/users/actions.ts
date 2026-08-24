"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UserActionResult = {
  success: boolean;
  error?: string;
};

/**
 * Ban a user by setting banned_until to a future date.
 * Only admins can perform this action.
 */
export async function banUser(
  userId: string,
  days: number = 30
): Promise<UserActionResult> {
  const supabase = await createClient();

  // Call database function which handles admin check
  const { data, error } = await supabase.rpc("admin_ban_user", {
    p_user_id: userId,
    p_days: days,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const result = data as any;
  if (!result?.success) {
    return { success: false, error: result?.error || "Failed to ban user" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Unban a user by clearing banned_until.
 * Only admins can perform this action.
 */
export async function unbanUser(userId: string): Promise<UserActionResult> {
  const supabase = await createClient();

  // Call database function which handles admin check
  const { data, error } = await supabase.rpc("admin_unban_user", {
    p_user_id: userId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const result = data as any;
  if (!result?.success) {
    return { success: false, error: result?.error || "Failed to unban user" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Delete a user permanently.
 * Only admins can perform this action.
 * WARNING: This action cannot be undone!
 */
export async function deleteUser(userId: string): Promise<UserActionResult> {
  const supabase = await createClient();

  // Call database function which handles admin check and self-deletion prevention
  const { data, error } = await supabase.rpc("admin_delete_user", {
    p_user_id: userId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const result = data as any;
  if (!result?.success) {
    return { success: false, error: result?.error || "Failed to delete user" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Send password reset email to a user.
 * Only admins can perform this action.
 */
export async function sendPasswordReset(
  email: string
): Promise<UserActionResult> {
  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return { success: false, error: "Not authenticated" };
  }

  const { data: isAdmin } = await supabase
    .from("admins")
    .select("id")
    .eq("user_id", currentUser.id)
    .eq("is_active", true)
    .single();

  if (!isAdmin) {
    return { success: false, error: "Admin access required" };
  }

  // Send password reset email (public operation, doesn't need service role)
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
