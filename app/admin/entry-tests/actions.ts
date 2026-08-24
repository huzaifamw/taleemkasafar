"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = {
  success: boolean;
  error?: string;
  data?: any;
};

/**
 * Create a new entry test.
 * Only admins can perform this action.
 */
export async function createEntryTest(formData: {
  slug: string;
  name: string;
  description?: string;
  external_id?: string;
  source?: string;
  is_active?: boolean;
  display_order?: number;
}): Promise<ActionResult> {
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

  // Check if slug already exists
  const { data: existingTest } = await supabase
    .from("entry_tests")
    .select("id")
    .eq("slug", formData.slug)
    .single();

  if (existingTest) {
    return { success: false, error: "Slug already exists" };
  }

  // Create entry test
  const { data, error } = await supabase
    .from("entry_tests")
    .insert({
      slug: formData.slug || '',
      name: formData.name,
      description: formData.description,
      external_id: formData.external_id,
      source: formData.source,
      is_active: formData.is_active ?? true,
      display_order: formData.display_order ?? 0,
    } as any)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/entry-tests");
  return { success: true, data };
}

/**
 * Update an existing entry test.
 * Only admins can perform this action.
 */
export async function updateEntryTest(
  id: string,
  formData: {
    slug?: string;
    name?: string;
    description?: string;
    external_id?: string;
    source?: string;
    is_active?: boolean;
    display_order?: number;
  }
): Promise<ActionResult> {
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

  // If slug is being updated, check if it's available
  if (formData.slug) {
    const { data: existingTest } = await supabase
      .from("entry_tests")
      .select("id")
      .eq("slug", formData.slug)
      .neq("id", id)
      .single();

    if (existingTest) {
      return { success: false, error: "Slug already exists" };
    }
  }

  // Update entry test
  const { data, error } = await supabase
    .from("entry_tests")
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/entry-tests");
  revalidatePath(`/admin/entry-tests/${id}`);
  return { success: true, data };
}

/**
 * Delete an entry test.
 * Only admins can perform this action.
 * WARNING: This will cascade delete related data!
 */
export async function deleteEntryTest(id: string): Promise<ActionResult> {
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

  // Check if entry test has questions
  const { count: questionsCount } = await supabase
    .from("question_tests")
    .select("id", { count: "exact", head: true })
    .eq("entry_test_id", id);

  if (questionsCount && questionsCount > 0) {
    return {
      success: false,
      error: `Cannot delete entry test with ${questionsCount} questions. Please remove questions first.`,
    };
  }

  // Delete entry test (cascades will handle test_subjects and blueprints)
  const { error } = await supabase
    .from("entry_tests")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/entry-tests");
  return { success: true };
}

/**
 * Toggle is_active status of an entry test.
 */
export async function toggleEntryTestActive(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
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

  const { error } = await supabase
    .from("entry_tests")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/entry-tests");
  return { success: true };
}

/**
 * Assign a subject to an entry test (create test_subject).
 */
export async function assignSubjectToTest(
  entryTestId: string,
  subjectId: string,
  formData: {
    nature_of_questions?: string;
    difficulty_profile?: Record<string, number>;
    display_order?: number;
    is_active?: boolean;
  }
): Promise<ActionResult> {
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

  // Check if this subject is already assigned
  const { data: existing } = await supabase
    .from("test_subjects")
    .select("id")
    .eq("entry_test_id", entryTestId)
    .eq("subject_id", subjectId)
    .is("deleted_at", null)
    .single();

  if (existing) {
    return { success: false, error: "Subject already assigned to this test" };
  }

  // Create test_subject
  const { data, error } = await supabase
    .from("test_subjects")
    .insert({
      entry_test_id: entryTestId,
      subject_id: subjectId,
      nature_of_questions: formData.nature_of_questions,
      difficulty_profile: formData.difficulty_profile || {},
      display_order: formData.display_order ?? 0,
      is_active: formData.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/entry-tests");
  revalidatePath(`/admin/entry-tests/${entryTestId}`);
  return { success: true, data };
}

/**
 * Update a test_subject configuration.
 */
export async function updateTestSubject(
  testSubjectId: string,
  formData: {
    nature_of_questions?: string;
    difficulty_profile?: Record<string, number>;
    display_order?: number;
    is_active?: boolean;
  }
): Promise<ActionResult> {
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

  const { data, error } = await supabase
    .from("test_subjects")
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", testSubjectId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/entry-tests");
  return { success: true, data };
}

/**
 * Remove a subject from an entry test (soft delete test_subject).
 */
export async function removeSubjectFromTest(
  testSubjectId: string
): Promise<ActionResult> {
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

  // Soft delete by setting deleted_at
  const { error } = await supabase
    .from("test_subjects")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", testSubjectId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/entry-tests");
  return { success: true };
}
