export const AI_MIN_COMPLETION_PERCENT = 30;
export const AI_LIMITED_DATA_PERCENT = 50;

export type AnalysisEligibility = {
  eligible: boolean;
  attemptedCount: number;
  totalQuestions: number;
  requiredAnswers: number;
  remainingAnswers: number;
  completionPercentage: number;
  limitedData: boolean;
};

/** Shared server/UI rules for deciding whether a mock has enough evidence. */
export function getAnalysisEligibility(
  attemptedCount: number,
  totalQuestions: number,
): AnalysisEligibility {
  const safeTotal = Math.max(0, totalQuestions);
  const safeAttempted = Math.min(Math.max(0, attemptedCount), safeTotal);
  const requiredAnswers = Math.ceil(safeTotal * (AI_MIN_COMPLETION_PERCENT / 100));
  const completionPercentage =
    safeTotal > 0 ? Math.round((safeAttempted / safeTotal) * 100) : 0;

  return {
    eligible: safeTotal > 0 && safeAttempted >= requiredAnswers,
    attemptedCount: safeAttempted,
    totalQuestions: safeTotal,
    requiredAnswers,
    remainingAnswers: Math.max(0, requiredAnswers - safeAttempted),
    completionPercentage,
    limitedData:
      safeTotal > 0 &&
      safeAttempted >= requiredAnswers &&
      safeAttempted / safeTotal < AI_LIMITED_DATA_PERCENT / 100,
  };
}

/** Minimum evidence required before a subject can influence recommendations. */
export function getRequiredSubjectAnswers(totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return Math.min(totalQuestions, Math.max(3, Math.ceil(totalQuestions * 0.3)));
}

export function isAnsweredSelection(selectedOptionId: string | null): boolean {
  return selectedOptionId !== null;
}

/** Accuracy denominator contains answered selections only. */
export function getAnsweredAccuracy(
  answers: Array<{ selectedOptionId: string | null; isCorrect: boolean | null }>,
): number {
  const answered = answers.filter(answer => isAnsweredSelection(answer.selectedOptionId));
  if (answered.length === 0) return 0;
  const correct = answered.filter(answer => answer.isCorrect === true).length;
  return Math.round((correct / answered.length) * 100);
}
