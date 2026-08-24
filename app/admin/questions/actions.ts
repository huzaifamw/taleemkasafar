"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type QuestionActionResult = {
  success: boolean;
  error?: string;
  id?: string;
};

/**
 * Delete a question (soft delete by setting deleted_at).
 * Only admins can perform this action.
 */
export async function deleteQuestion(
  questionId: string
): Promise<QuestionActionResult> {
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

  // Soft delete
  const { error } = await supabase
    .from("questions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", questionId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/questions");
  return { success: true };
}

/**
 * Update question moderation status.
 * Only admins can perform this action.
 */
export async function updateQuestionStatus(
  questionId: string,
  status: "approved" | "rejected" | "pending",
  reviewNote?: string
): Promise<QuestionActionResult> {
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
    .from("questions")
    .update({
      moderation_status: status as any,
      review_note: reviewNote || null,
    })
    .eq("id", questionId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/questions");
  return { success: true };
}

/**
 * Create a new question with options.
 * Only admins can perform this action.
 */
export async function createQuestion(formData: FormData): Promise<QuestionActionResult> {
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

  // Extract form data
  const statement = formData.get("statement") as string;
  const subjectId = formData.get("subject_id") as string;
  const topicId = (formData.get("topic_id") as string) || null;
  const difficulty = formData.get("difficulty") as string;
  const explanation = (formData.get("explanation") as string) || null;
  const source = (formData.get("source") as string) || null;
  const externalId = formData.get("external_id") as string;

  // Options (assuming 4 options: A, B, C, D)
  const optionA = formData.get("option_a") as string;
  const optionB = formData.get("option_b") as string;
  const optionC = formData.get("option_c") as string;
  const optionD = formData.get("option_d") as string;
  const correctOption = formData.get("correct_option") as string;

  if (!statement || !subjectId || !difficulty || !externalId) {
    return { success: false, error: "Missing required fields" };
  }

  if (!optionA || !optionB || !optionC || !optionD || !correctOption) {
    return { success: false, error: "All options and correct answer are required" };
  }

  // Insert question
  const { data: question, error: questionError } = await supabase
    .from("questions")
    .insert({
      statement,
      subject_id: subjectId,
      topic_id: topicId,
      difficulty: difficulty as any,
      explanation,
      source,
      external_id: externalId,
      statement_format: "plain",
      explanation_format: "plain",
      moderation_status: "approved",
    })
    .select()
    .single();

  if (questionError || !question) {
    return { success: false, error: questionError?.message || "Failed to create question" };
  }

  // Insert options
  const options = [
    { label: "A", text: optionA, is_correct: correctOption === "A" },
    { label: "B", text: optionB, is_correct: correctOption === "B" },
    { label: "C", text: optionC, is_correct: correctOption === "C" },
    { label: "D", text: optionD, is_correct: correctOption === "D" },
  ];

  const { error: optionsError } = await supabase
    .from("question_options")
    .insert(
      options.map((opt, idx) => ({
        question_id: question.id,
        option_label: opt.label,
        content: opt.text,
        content_format: "plain" as const,
        is_correct: opt.is_correct,
        display_order: idx,
      })) as any
    );

  if (optionsError) {
    // Rollback question
    await supabase.from("questions").delete().eq("id", question.id);
    return { success: false, error: optionsError.message };
  }

  revalidatePath("/admin/questions");
  return { success: true, id: question.id };
}

/**
 * Get topics for a specific subject.
 * Server Action that can be called from client components.
 */
export async function getTopicsBySubjectAction(subjectId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("topics")
    .select("id, title")
    .eq("subject_id", subjectId)
    .order("display_order");

  if (error) {
    console.error("Error fetching topics:", error);
    return [];
  }

  return data?.map(topic => ({ id: topic.id, name: topic.title })) || [];
}
