import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getActiveEntryTest, type EntryTest } from "./entry-test";
import {
  getEntryTestsCached,
  getSubjectsCached,
  type SubjectOverview,
} from "./catalog";
import { getViewerContext } from "./profile";

export type { SubjectOverview };

export type DashboardData = {
  displayName: string;
  email: string | null;
  entryTest: EntryTest;
  tests: EntryTest[];
  subjects: SubjectOverview[];
  /** True once the user has any recorded attempts (drives empty states). */
  hasActivity: boolean;
};

/**
 * Whether the signed-in user has any recorded attempts. Request-memoized so it
 * can stream in its own Suspense boundary without duplicate queries.
 */
export const getHasActivity = cache(async (): Promise<boolean> => {
  const viewer = await getViewerContext();
  if (!viewer) return false;

  const supabase = await createClient();
  const { count } = await supabase
    .from("attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", viewer.id);
  return (count ?? 0) > 0;
});

/**
 * Server-only loader for the dashboard home.
 * - User-specific data (profile, selected test, attempts) → dynamic cookie client.
 * - Catalog data (tests list, subjects + counts) → cached anon client.
 */
export async function getDashboardData(): Promise<DashboardData | null> {
  const viewer = await getViewerContext();
  if (!viewer) return null;

  const supabase = await createClient();
  const [entryTest, tests] = await Promise.all([
    getActiveEntryTest(),
    getEntryTestsCached(),
  ]);

  if (!entryTest) return null;

  const [subjects, { count: attemptCount }] = await Promise.all([
    getSubjectsCached(entryTest.slug),
    supabase
      .from("attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", viewer.id),
  ]);

  return {
    displayName: viewer.displayName,
    email: viewer.email,
    entryTest,
    tests,
    subjects,
    hasActivity: (attemptCount ?? 0) > 0,
  };
}
