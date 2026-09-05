import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getViewerContext } from "./profile";

export type EntryTest = {
  id: string;
  slug: string;
  name: string;
};

/**
 * Resolve the user's active entry test: their selected one, else the first
 * active test. Server-only; runs under the caller's RLS context.
 *
 * Wrapped in React `cache()` so multiple components in the same request (header,
 * hero, subjects — each in its own Suspense boundary) share ONE resolution
 * instead of repeating the profile + entry_tests lookups.
 */
export const getActiveEntryTest = cache(
  async (): Promise<EntryTest | null> => {
    const viewer = await getViewerContext();
    if (!viewer) return null;

    const supabase = await createClient();

    if (viewer.selectedTestId) {
      const { data } = await supabase
        .from("entry_tests")
        .select("id, slug, name")
        .eq("id", viewer.selectedTestId)
        .eq("is_active", true)
        .maybeSingle();
      if (data) return data;
    }

    const { data } = await supabase
      .from("entry_tests")
      .select("id, slug, name")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    return data ?? null;
  },
);
