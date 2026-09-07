import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

type EntryTest = Database["public"]["Tables"]["entry_tests"]["Row"];
type TestSubject = Database["public"]["Tables"]["test_subjects"]["Row"];
type MockBlueprint = Database["public"]["Tables"]["mock_test_blueprints"]["Row"];

export type AdminEntryTest = EntryTest & {
  subjects_count?: number;
  questions_count?: number;
  blueprints_count?: number;
  test_subjects?: (TestSubject & {
    subject_name?: string;
  })[];
};

export type EntryTestWithDetails = AdminEntryTest & {
  mock_blueprints?: MockBlueprint[];
};

/**
 * Get all entry tests with counts.
 * Only admins can access this data.
 */
export async function getAllEntryTests(): Promise<AdminEntryTest[]> {
  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return [];
  }

  const { data: isAdmin } = await supabase
    .from("admins")
    .select("id")
    .eq("user_id", currentUser.id)
    .eq("is_active", true)
    .single();

  if (!isAdmin) {
    return [];
  }

  // Get entry tests
  const { data: entryTests, error } = await supabase
    .from("entry_tests")
    .select("*")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !entryTests) {
    console.error("Error fetching entry tests:", error);
    return [];
  }

  // Ask Postgres for exact counts instead of downloading rows and counting in
  // JavaScript. Supabase caps ordinary row responses (commonly at 1,000),
  // which made later tests display partial question totals.
  return Promise.all(
    entryTests.map(async (entryTest) => {
      const [subjectsResult, questionsResult, blueprintsResult] =
        await Promise.all([
          supabase
            .from("test_subjects")
            .select("id", { count: "exact", head: true })
            .eq("entry_test_id", entryTest.id)
            .is("deleted_at", null),
          supabase
            .from("question_tests")
            .select("id", { count: "exact", head: true })
            .eq("entry_test_id", entryTest.id),
          supabase
            .from("mock_test_blueprints")
            .select("id", { count: "exact", head: true })
            .eq("entry_test_id", entryTest.id),
        ]);

      return {
        ...entryTest,
        subjects_count: subjectsResult.count ?? 0,
        questions_count: questionsResult.count ?? 0,
        blueprints_count: blueprintsResult.count ?? 0,
      };
    }),
  );
}

/**
 * Get a single entry test by ID with full details.
 */
export async function getEntryTestById(
  id: string
): Promise<EntryTestWithDetails | null> {
  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return null;
  }

  const { data: isAdmin } = await supabase
    .from("admins")
    .select("id")
    .eq("user_id", currentUser.id)
    .eq("is_active", true)
    .single();

  if (!isAdmin) {
    return null;
  }

  // Get entry test
  const { data: entryTest, error } = await supabase
    .from("entry_tests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !entryTest) {
    console.error("Error fetching entry test:", error);
    return null;
  }

  // Get test subjects with subject names
  const { data: testSubjects } = await supabase
    .from("test_subjects")
    .select(
      `
      *,
      subjects!inner(id, name)
    `
    )
    .eq("entry_test_id", id)
    .is("deleted_at", null)
    .order("display_order");

  // Get mock blueprints
  const { data: mockBlueprints } = await supabase
    .from("mock_test_blueprints")
    .select("*")
    .eq("entry_test_id", id)
    .order("display_order");

  // Get counts
  const { count: questionsCount } = await supabase
    .from("question_tests")
    .select("id", { count: "exact", head: true })
    .eq("entry_test_id", id);

  return {
    ...entryTest,
    subjects_count: testSubjects?.length || 0,
    questions_count: questionsCount || 0,
    blueprints_count: mockBlueprints?.length || 0,
    test_subjects: testSubjects?.map((ts) => ({
      ...ts,
      subject_name: ts.subjects?.name,
    })) || [],
    mock_blueprints: mockBlueprints || [],
  };
}

/**
 * Get all subjects for assignment dropdown.
 */
export async function getAllSubjectsForAssignment() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, slug, external_id")
    .order("name");

  if (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }

  return data || [];
}

/**
 * Get test subjects for a specific entry test.
 */
export async function getTestSubjectsByEntryTest(entryTestId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("test_subjects")
    .select(
      `
      *,
      subjects!inner(id, name, slug)
    `
    )
    .eq("entry_test_id", entryTestId)
    .is("deleted_at", null)
    .order("display_order");

  if (error) {
    console.error("Error fetching test subjects:", error);
    return [];
  }

  return data?.map((ts) => ({
    ...ts,
    subject_name: ts.subjects?.name,
    subject_slug: ts.subjects?.slug,
  })) || [];
}

/**
 * Check if a slug is available for a new entry test.
 */
export async function isSlugAvailable(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createClient();

  let query = supabase
    .from("entry_tests")
    .select("id")
    .eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.single();

  // If no data found, slug is available
  return !data && !error;
}
