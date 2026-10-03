import { describe, expect, it } from "vitest";
import {
  buildAnalysisPrompt,
  hasEnoughTopicEvidence,
  type PerformanceData,
} from "./analysis-prompt";
import { buildEvidenceSummary } from "./analysis-evidence";

const performanceData: PerformanceData = {
  overallScore: 55,
  answeredAccuracy: 55,
  attemptedCount: 60,
  totalQuestions: 100,
  completionPercentage: 60,
  limitedData: false,
  timeTaken: 3_600_000,
  testName: "Test Mock",
  subjectBreakdown: [
    {
      subject: "Mathematics",
      score: 4,
      total: 10,
      availableTotal: 20,
      requiredAnswers: 6,
      percentage: 40,
    },
  ],
  excludedSubjects: [],
  topicBreakdown: [
    { topic: "Algebra", subject: "Mathematics", score: 1, total: 3, percentage: 33 },
    { topic: "Vectors", subject: "Mathematics", score: 0, total: 2, percentage: 0 },
  ],
  difficultyBreakdown: {
    easy: { correct: 3, total: 5, percentage: 60 },
    medium: { correct: 1, total: 3, percentage: 33 },
    hard: { correct: 0, total: 2, percentage: 0 },
  },
};

describe("flexible AI analysis prompt", () => {
  it("requires variable evidence-based list lengths instead of fixed counts", () => {
    const prompt = buildAnalysisPrompt(performanceData);

    expect(prompt).toContain("Every output array is variable-length");
    expect(prompt).toContain("may be zero");
    expect(prompt).not.toContain("Limit to 5 study recommendations");
    expect(prompt).not.toContain("Limit to 3-5 practice recommendations");
  });

  it("includes only topics with enough answered-question evidence", () => {
    const prompt = buildAnalysisPrompt(performanceData);

    expect(prompt).toContain("Algebra (Mathematics)");
    expect(prompt).not.toContain("Vectors (Mathematics)");
  });

  it("requires at least three topic answers", () => {
    expect(hasEnoughTopicEvidence(2)).toBe(false);
    expect(hasEnoughTopicEvidence(3)).toBe(true);
  });

  it("returns exactly the strong and weak areas supported by the result", () => {
    const summary = buildEvidenceSummary({
      ...performanceData,
      subjectBreakdown: [
        ...performanceData.subjectBreakdown,
        {
          subject: "English",
          score: 8,
          total: 10,
          availableTotal: 10,
          requiredAnswers: 3,
          percentage: 80,
        },
      ],
      topicBreakdown: [
        ...performanceData.topicBreakdown,
        { topic: "Grammar", subject: "English", score: 3, total: 3, percentage: 100 },
      ],
    });

    expect(summary.strengths).toHaveLength(2);
    expect(summary.weaknesses).toHaveLength(2);
    expect(summary.weakSubjects).toHaveLength(1);
    expect(summary.weakTopics).toHaveLength(1);
    expect(summary.weakTopics[0].topic).toBe("Algebra");
  });
});
