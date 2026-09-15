import { describe, expect, it } from "vitest";
import {
  getAnalysisEligibility,
  getAnsweredAccuracy,
  getRequiredSubjectAnswers,
  isAnsweredSelection,
} from "./analysis-eligibility";

describe("getAnalysisEligibility", () => {
  it("requires 30 percent of the test, rounded up", () => {
    expect(getAnalysisEligibility(35, 120)).toMatchObject({
      eligible: false,
      requiredAnswers: 36,
      remainingAnswers: 1,
    });
    expect(getAnalysisEligibility(36, 120)).toMatchObject({
      eligible: true,
      completionPercentage: 30,
      limitedData: true,
    });
  });

  it("removes the limited-data warning at 50 percent", () => {
    expect(getAnalysisEligibility(49, 100).limitedData).toBe(true);
    expect(getAnalysisEligibility(50, 100).limitedData).toBe(false);
  });

  it("rejects empty tests and clamps invalid counts", () => {
    expect(getAnalysisEligibility(0, 0).eligible).toBe(false);
    expect(getAnalysisEligibility(150, 100).attemptedCount).toBe(100);
  });
});

describe("getRequiredSubjectAnswers", () => {
  it("uses 30 percent with a three-answer floor", () => {
    expect(getRequiredSubjectAnswers(30)).toBe(9);
    expect(getRequiredSubjectAnswers(10)).toBe(3);
    expect(getRequiredSubjectAnswers(4)).toBe(3);
    expect(getRequiredSubjectAnswers(2)).toBe(2);
  });
});

describe("answered-only accuracy", () => {
  it("never counts an unanswered row as incorrect", () => {
    const answers = [
      { selectedOptionId: "option-a", isCorrect: true },
      { selectedOptionId: "option-b", isCorrect: false },
      { selectedOptionId: null, isCorrect: false },
      { selectedOptionId: null, isCorrect: null },
    ];

    expect(isAnsweredSelection(null)).toBe(false);
    expect(getAnsweredAccuracy(answers)).toBe(50);
  });
});
