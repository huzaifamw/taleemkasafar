import { createClient } from "@/lib/supabase/server";

/**
 * Admin-only query functions.
 * All functions require the current user to be an active admin.
 */

export type DashboardStats = {
  total_users: number;
  total_attempts: number;
  total_mock_attempts: number;
  total_practice_attempts: number;
  total_questions: number;
  total_blogs: number;
  published_blogs: number;
  recent_signups_7days: number;
  active_users_today: number;
};

export type RecentTestSubmission = {
  attempt_id: string;
  user_id: string;
  user_email: string;
  usage: string;
  entry_test_name: string | null;
  subject_name: string | null;
  score_percent: number;
  submitted_at: string;
};

export type UserActivityStat = {
  date: string;
  new_signups: number;
  active_users: number;
  total_attempts: number;
};

/**
 * Get aggregated dashboard statistics.
 * Returns null if user is not an admin.
 */
export async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_admin_dashboard_stats");

    if (error) {
      console.error("Error fetching dashboard stats:", error.message || error);
      return null;
    }

    return data as DashboardStats;
  } catch (err) {
    console.error("Exception fetching dashboard stats:", err);
    return null;
  }
}

/**
 * Get recent test submissions with user details.
 * Returns empty array if user is not an admin.
 */
export async function getRecentTestSubmissions(
  limit: number = 20
): Promise<RecentTestSubmission[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_recent_test_submissions", {
      p_limit: limit,
    });

    if (error) {
      console.error("Error fetching recent test submissions:", error.message || error);
      return [];
    }

    // The function now returns JSONB, so we can parse it directly
    if (!data) {
      return [];
    }

    // If data is already an array, return it; otherwise parse it
    return Array.isArray(data) ? (data as any) : [];
  } catch (err) {
    console.error("Exception fetching recent test submissions:", err);
    return [];
  }
}

/**
 * Get user activity statistics for the specified number of days.
 * Returns empty array if user is not an admin.
 */
export async function getUserActivityStats(
  days: number = 30
): Promise<UserActivityStat[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_user_activity_stats", {
    p_days: days,
  });

  if (error) {
    console.error("Error fetching user activity stats:", error);
    return [];
  }

  return data as UserActivityStat[];
}

/**
 * Check if the current user is an admin.
 * Used by client components to conditionally render admin features.
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data } = await supabase
    .from("admins")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  return !!data;
}
