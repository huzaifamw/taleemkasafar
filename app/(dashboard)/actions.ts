"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CATALOG_TAG } from "@/lib/queries/catalog";

/**
 * Server Action: set the signed-in user's selected entry test.
 * Business logic on the server; the header selector calls this.
 */
export async function selectEntryTest(
  entryTestId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: updated, error } = await supabase.rpc("select_entry_test", {
    p_entry_test_id: entryTestId,
  });

  if (error || !updated) {
    return {
      success: false,
      error: "Unable to switch entry test. Please try again.",
    };
  }

  // Catalog data is shared and remains cached. The client refreshes only the
  // currently visible route after this action succeeds.
  return { success: true };
}

/**
 * Revalidate cached catalog data. Call after importing/editing the question
 * bank so subject/chapter counts refresh. (Wire to an admin action later.)
 */
export async function revalidateCatalog(): Promise<void> {
  revalidateTag(CATALOG_TAG, "max");
}
