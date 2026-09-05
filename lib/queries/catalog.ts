import { unstable_cache } from "next/cache";
import { createAnonClient } from "@/lib/supabase/anon";
import type { Database } from "@/lib/database.types";
import type { EntryTest } from "./entry-test";

export type SubjectOverview =
  Database["public"]["Views"]["subject_overview"]["Row"];
export type ChapterOverview =
  Database["public"]["Views"]["chapter_overview"]["Row"];

// Cache tags — revalidate after catalog import or schema data changes.
export const CATALOG_TAG = "catalog";

/**
 * Cached: active entry tests (for the selector). Public reference data, cached
 * across all users/navigations until the `catalog` tag is revalidated.
 */
export const getEntryTestsCached = unstable_cache(
  async (): Promise<EntryTest[]> => {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("entry_test_public")
      .select("id, slug, name")
      .order("display_order", { ascending: true });
    return (data ?? []).filter(
      (t): t is EntryTest => !!t.id && !!t.slug && !!t.name,
    );
  },
  ["entry-tests-cached-v2"],
  { tags: [CATALOG_TAG] }
);

/**
 * Cached: subject overview (chapter + question counts) for an entry test.
 * Keyed by testSlug; cached until the `catalog` tag is revalidated.
 */
export const getSubjectsCached = unstable_cache(
  async (testSlug: string): Promise<SubjectOverview[]> => {
    const supabase = createAnonClient();
    const subjectsQuery = supabase
      .from("subject_overview")
      .select("*")
      .eq("entry_test_slug", testSlug)
      .order("display_order", { ascending: true });

    const [{ data: subjects }, { data: populatedChapters }] = await Promise.all([
      subjectsQuery,
      supabase
        .from("chapter_overview")
        .select("subject_id")
        .eq("entry_test_slug", testSlug)
        .gt("question_count", 0),
    ]);

    const populatedChapterCounts = new Map<string, number>();
    for (const chapter of populatedChapters ?? []) {
      if (!chapter.subject_id) continue;
      populatedChapterCounts.set(
        chapter.subject_id,
        (populatedChapterCounts.get(chapter.subject_id) ?? 0) + 1,
      );
    }

    return (subjects ?? []).map((subject) => ({
      ...subject,
      chapter_count: subject.subject_id
        ? (populatedChapterCounts.get(subject.subject_id) ?? 0)
        : 0,
    }));
  },
  ["subjects-cached-v2"],
  { 
    tags: [CATALOG_TAG],
    revalidate: 3600 // 1 hour
  }
);

/**
 * Cached: chapters (with counts) for a subject within an entry test.
 */
export const getChaptersCached = unstable_cache(
  async (
    testSlug: string,
    subjectSlug: string,
  ): Promise<ChapterOverview[]> => {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("chapter_overview")
      .select("*")
      .eq("entry_test_slug", testSlug)
      .eq("subject_slug", subjectSlug)
      .gt("question_count", 0)
      .order("display_order", { ascending: true });
    return data ?? [];
  },
  ["chapters-cached-v2"],
  { 
    tags: [CATALOG_TAG],
    revalidate: 3600 // 1 hour
  }
);
