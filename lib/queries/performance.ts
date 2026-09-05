import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getActiveEntryTest } from "./entry-test";
import { listMockResults, type MockResultSummary } from "./mock";
import { getViewerContext } from "./profile";

export type PracticeAccuracy = {
  answered: number;
  correct: number;
  accuracyPercent: number;
};

export type PerformanceData = {
  mockResults: MockResultSummary[];
  practice: PracticeAccuracy;
  bestScore: number | null;
  averageScore: number | null;
};

/**
 * Aggregate the user's performance: mock history + a basic practice accuracy
 * summary derived from graded practice answers. All reads are owner-scoped via
 * RLS (cookie client).
 */
export async function getPerformance(): Promise<PerformanceData | null> {
  const viewer = await getViewerContext();
  if (!viewer) return null;

  const supabase = await createClient();
  const entryTest = await getActiveEntryTest();
  if (!entryTest) return null;

  // Practice accuracy for the selected test. is_correct is set by the grading
  // RPC at answer time.
  const [mockResults, { data: practiceAttempts }] = await Promise.all([
    listMockResults(50, entryTest.id),
    supabase
      .from("attempts")
      .select("id")
      .eq("user_id", viewer.id)
      .eq("entry_test_id", entryTest.id)
      .eq("mode", "practice"),
  ]);
  const attemptIds = (practiceAttempts ?? []).map((a) => a.id);

  let answered = 0;
  let correct = 0;
  if (attemptIds.length > 0) {
    const { data: answers } = await supabase
      .from("attempt_answers")
      .select("is_correct")
      .in("attempt_id", attemptIds)
      .not("selected_option_id", "is", null);
    for (const a of answers ?? []) {
      answered += 1;
      if (a.is_correct) correct += 1;
    }
  }

  const scores = mockResults.map((r) => r.scorePercent);
  const bestScore = scores.length ? Math.max(...scores) : null;
  const averageScore = scores.length
    ? Math.round((scores.reduce((s, n) => s + n, 0) / scores.length) * 100) / 100
    : null;

  return {
    mockResults,
    practice: {
      answered,
      correct,
      accuracyPercent:
        answered === 0 ? 0 : Math.round((correct / answered) * 10000) / 100,
    },
    bestScore,
    averageScore,
  };
}
