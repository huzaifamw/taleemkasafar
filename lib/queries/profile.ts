import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { resolveDisplayName } from "./dashboard-helpers";

export type ViewerContext = {
  id: string;
  email: string | null;
  displayName: string;
  selectedTestId: string | null;
};

/**
 * Authenticated viewer data shared by all server components in one request.
 * This prevents each header/page query from validating the same JWT and
 * loading the same profile again.
 */
export const getViewerContext = cache(async (): Promise<ViewerContext | null> => {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const id = claims?.claims?.sub as string | undefined;
  const email = (claims?.claims?.email as string | undefined) ?? null;
  if (!id) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, selected_test_id")
    .eq("id", id)
    .maybeSingle();

  return {
    id,
    email,
    displayName: resolveDisplayName(profile?.display_name, email),
    selectedTestId: profile?.selected_test_id ?? null,
  };
});

/**
 * The signed-in user's friendly display name (for the header avatar/label).
 * Request-memoized so the header and other consumers share one lookup.
 */
export const getDisplayName = cache(async (): Promise<string> => {
  const viewer = await getViewerContext();
  return viewer?.displayName ?? resolveDisplayName(null, null);
});
