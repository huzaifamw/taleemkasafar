import { createClient } from "@/lib/supabase/server";

export type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  banned_until: string | null;
  // User metadata
  display_name?: string;
  // Statistics
  total_attempts?: number;
  total_mocks?: number;
};

/**
 * Get all users with pagination and search.
 * Only admins can access this data.
 */
export async function getAllUsers(
  search: string = "",
  page: number = 1,
  pageSize: number = 20
): Promise<{ users: AdminUser[]; total: number; totalPages: number }> {
  const supabase = await createClient();

  // Call the database function which handles admin check
  const { data, error } = await supabase.rpc("get_all_users_admin", {
    p_search: search,
    p_page: page,
    p_page_size: pageSize,
  });

  if (error || !data) {
    console.error("Error fetching users:", error);
    return { users: [], total: 0, totalPages: 0 };
  }

  const result = data as any;
  return {
    users: result?.users || [],
    total: result?.total || 0,
    totalPages: result?.totalPages || 0,
  };
}

/**
 * Get a single user by ID with detailed information.
 */
export async function getUserById(userId: string): Promise<AdminUser | null> {
  const supabase = await createClient();

  // Call the database function which handles admin check
  const { data, error } = await supabase.rpc("get_user_by_id_admin", {
    p_user_id: userId,
  });

  if (error || !data) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data as AdminUser;
}
