import { describe, expect, it } from "vitest";
import {
  validateMockBlueprint,
  type MockBlueprintInput,
} from "./mock-blueprint";

const validBlueprint: MockBlueprintInput = {
  entryTestId: "test-id",
  name: "Engineering Full Mock",
  description: "A complete mock test.",
  durationSeconds: 6_000,
  totalQuestions: 100,
  scoringMode: "uniform",
  marksPerCorrect: 4,
  marksPerIncorrect: 0,
  marksPerUnanswered: 0,
  isActive: true,
  displayOrder: 0,
  slots: [
    {
      testSubjectId: "subject-id",
      subjectName: "Mathematics",
      questionCount: 100,
      pastPaperCount: 30,
      practiceCount: 70,
      easyCount: 30,
      mediumCount: 50,
      hardCount: 20,
      weightPercent: null,
      sectionDurationSeconds: null,
      displayOrder: 0,
    },
  ],
};

describe("validateMockBlueprint", () => {
  it("accepts a complete uniform blueprint", () => {
    expect(validateMockBlueprint(validBlueprint)).toBeNull();
  });

  it("rejects a slot total that differs from the blueprint total", () => {
    expect(
      validateMockBlueprint({ ...validBlueprint, totalQuestions: 99 }),
    ).toContain("Subject slots total 100");
  });

  it("rejects invalid source and difficulty distributions", () => {
    const slot = validBlueprint.slots[0];
    expect(
      validateMockBlueprint({
        ...validBlueprint,
        slots: [{ ...slot, practiceCount: 60 }],
      }),
    ).toContain("past-paper and practice");
    expect(
      validateMockBlueprint({
        ...validBlueprint,
        slots: [{ ...slot, hardCount: 10 }],
      }),
    ).toContain("easy, medium and hard");
  });

  it("requires weighted sections to total 100 percent and full duration", () => {
    const slot = validBlueprint.slots[0];
    expect(
      validateMockBlueprint({
        ...validBlueprint,
        scoringMode: "section_weighted",
        slots: [
          {
            ...slot,
            weightPercent: 90,
            sectionDurationSeconds: 6_000,
          },
        ],
      }),
    ).toContain("100%");
    expect(
      validateMockBlueprint({
        ...validBlueprint,
        scoringMode: "section_weighted",
        slots: [
          {
            ...slot,
            weightPercent: 100,
            sectionDurationSeconds: 5_400,
          },
        ],
      }),
    ).toContain("Section times");
  });
});
