import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getActiveEntryTest } from "./entry-test";
import { getViewerContext } from "./profile";
import type { Database } from "@/lib/database.types";

type Difficulty = Database["public"]["Enums"]["difficulty"];
type Usage = Database["public"]["Enums"]["question_usage"];

export type BookmarkedOption = {
  id: string;
  label: string;
  content: string;
  isCorrect: boolean;
};

export type BookmarkedQuestion = {
  bookmarkId: string;
  questionId: string;
  statement: string;
  explanation: string | null;
  difficulty: Difficulty;
  subjectName: string;
  subjectSlug: string;
  topicName: string | null;
  usages: Usage[];
  options: BookmarkedOption[];
  savedAt: string;
};

/**
 * Load the signed-in student's bookmarks for their currently selected test.
 * Correct answers are deliberately loaded only for this private revision page;
 * normal practice and past-paper question loaders remain answer-free.
 */
export async function getBookmarkedQuestions(): Promise<BookmarkedQuestion[] | null> {
  const [viewer, entryTest] = await Promise.all([
    getViewerContext(),
    getActiveEntryTest(),
  ]);
  if (!viewer || !entryTest) return null;

  const supabase = await createClient();
  const { data: bookmarkRows, error: bookmarkError } = await supabase
    .from("bookmarks")
    .select("id, question_id, created_at")
    .eq("user_id", viewer.id)
    .order("created_at", { ascending: false });

  if (bookmarkError) {
    console.error("Failed to load bookmarks:", bookmarkError.message);
    return [];
  }
  if (!bookmarkRows?.length) return [];

  const bookmarkedIds = bookmarkRows.map((bookmark) => bookmark.question_id);
  const { data: testRows, error: testError } = await supabase
    .from("question_tests")
    .select("question_id, usage_type")
    .eq("entry_test_id", entryTest.id)
    .in("question_id", bookmarkedIds);

  if (testError) {
    console.error("Failed to match bookmarks to the selected test:", testError.message);
    return [];
  }

  const usagesByQuestion = new Map<string, Set<Usage>>();
  for (const row of testRows ?? []) {
    const usages = usagesByQuestion.get(row.question_id) ?? new Set<Usage>();
    usages.add(row.usage_type);
    usagesByQuestion.set(row.question_id, usages);
  }

  const eligibleIds = bookmarkedIds.filter((id) => usagesByQuestion.has(id));
  if (!eligibleIds.length) return [];

  const [{ data: questionRows, error: questionError }, { data: optionRows }] =
    await Promise.all([
      supabase
        .from("questions")
        .select(
          "id, statement, explanation, difficulty, subject_id, topic_id, subjects!inner(name, slug), topics(title)",
        )
        .in("id", eligibleIds)
        .is("deleted_at", null)
        .eq("moderation_status", "approved"),
      supabase
        .from("question_options")
        .select("id, question_id, option_label, content, is_correct, display_order")
        .in("question_id", eligibleIds)
        .order("display_order", { ascending: true }),
    ]);

  if (questionError) {
    console.error("Failed to load bookmarked questions:", questionError.message);
    return [];
  }

  const optionsByQuestion = new Map<string, BookmarkedOption[]>();
  for (const option of optionRows ?? []) {
    const options = optionsByQuestion.get(option.question_id) ?? [];
    options.push({
      id: option.id,
      label: option.option_label,
      content: option.content,
      isCorrect: option.is_correct,
    });
    optionsByQuestion.set(option.question_id, options);
  }

  const questionsById = new Map((questionRows ?? []).map((question) => [question.id, question]));

  return bookmarkRows.flatMap((bookmark) => {
    const question = questionsById.get(bookmark.question_id);
    if (!question) return [];

    return [{
      bookmarkId: bookmark.id,
      questionId: question.id,
      statement: question.statement,
      explanation: question.explanation,
      difficulty: question.difficulty,
      subjectName: question.subjects.name,
      subjectSlug: question.subjects.slug,
      topicName: question.topics?.title ?? null,
      usages: Array.from(usagesByQuestion.get(question.id) ?? []),
      options: optionsByQuestion.get(question.id) ?? [],
      savedAt: bookmark.created_at,
    }];
  });
}
