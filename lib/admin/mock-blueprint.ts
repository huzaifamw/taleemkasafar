export type MockScoringMode = "uniform" | "section_weighted";

export type MockBlueprintSlotInput = {
  testSubjectId: string;
  subjectName: string;
  questionCount: number;
  pastPaperCount: number;
  practiceCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  weightPercent: number | null;
  sectionDurationSeconds: number | null;
  displayOrder: number;
};

export type MockBlueprintInput = {
  id?: string;
  entryTestId: string;
  name: string;
  description: string;
  durationSeconds: number;
  totalQuestions: number;
  scoringMode: MockScoringMode;
  marksPerCorrect: number;
  marksPerIncorrect: number;
  marksPerUnanswered: number;
  isActive: boolean;
  displayOrder: number;
  slots: MockBlueprintSlotInput[];
};

const isWholeNumber = (value: number) =>
  Number.isFinite(value) && Number.isInteger(value);

export function validateMockBlueprint(
  input: MockBlueprintInput,
): string | null {
  const name = input.name.trim();
  if (name.length < 3 || name.length > 120) {
    return "Blueprint name must be between 3 and 120 characters.";
  }
  if (input.description.trim().length > 1_000) {
    return "Description must be 1,000 characters or fewer.";
  }
  if (
    !isWholeNumber(input.durationSeconds) ||
    input.durationSeconds < 60 ||
    input.durationSeconds > 86_400
  ) {
    return "Duration must be between 1 minute and 24 hours.";
  }
  if (
    !isWholeNumber(input.totalQuestions) ||
    input.totalQuestions < 1 ||
    input.totalQuestions > 1_000
  ) {
    return "Total questions must be between 1 and 1,000.";
  }
  if (!Number.isFinite(input.displayOrder) || !isWholeNumber(input.displayOrder)) {
    return "Display order must be a whole number.";
  }
  for (const [label, value] of [
    ["Marks per correct answer", input.marksPerCorrect],
    ["Marks per incorrect answer", input.marksPerIncorrect],
    ["Marks per unanswered question", input.marksPerUnanswered],
  ] as const) {
    if (!Number.isFinite(value) || value < -100 || value > 100) {
      return `${label} must be between -100 and 100.`;
    }
  }
  if (input.slots.length === 0) {
    return "Select at least one subject slot.";
  }

  const subjectIds = new Set<string>();
  for (const slot of input.slots) {
    if (!slot.testSubjectId || subjectIds.has(slot.testSubjectId)) {
      return "Each subject can appear only once in a blueprint.";
    }
    subjectIds.add(slot.testSubjectId);

    const counts = [
      slot.questionCount,
      slot.pastPaperCount,
      slot.practiceCount,
      slot.easyCount,
      slot.mediumCount,
      slot.hardCount,
    ];
    if (counts.some((value) => !isWholeNumber(value) || value < 0)) {
      return `${slot.subjectName}: all question counts must be non-negative whole numbers.`;
    }
    if (slot.questionCount < 1) {
      return `${slot.subjectName}: question count must be at least 1.`;
    }
    if (slot.pastPaperCount + slot.practiceCount !== slot.questionCount) {
      return `${slot.subjectName}: past-paper and practice counts must equal the subject total.`;
    }
    if (slot.easyCount + slot.mediumCount + slot.hardCount !== slot.questionCount) {
      return `${slot.subjectName}: easy, medium and hard counts must equal the subject total.`;
    }
  }

  const slotTotal = input.slots.reduce(
    (sum, slot) => sum + slot.questionCount,
    0,
  );
  if (slotTotal !== input.totalQuestions) {
    return `Subject slots total ${slotTotal}, but the blueprint total is ${input.totalQuestions}.`;
  }

  if (input.scoringMode === "section_weighted") {
    const weightTotal = input.slots.reduce(
      (sum, slot) => sum + (slot.weightPercent ?? 0),
      0,
    );
    if (Math.abs(weightTotal - 100) > 0.001) {
      return `Section weights must total 100%. Current total: ${weightTotal}%.`;
    }
    const sectionDurationTotal = input.slots.reduce(
      (sum, slot) => sum + (slot.sectionDurationSeconds ?? 0),
      0,
    );
    if (sectionDurationTotal !== input.durationSeconds) {
      return "Section times must add up to the full test duration.";
    }
    if (
      input.slots.some(
        (slot) =>
          !Number.isFinite(slot.weightPercent) ||
          (slot.weightPercent ?? 0) <= 0 ||
          !isWholeNumber(slot.sectionDurationSeconds ?? 0) ||
          (slot.sectionDurationSeconds ?? 0) < 60,
      )
    ) {
      return "Every weighted section needs a positive weight and at least one minute.";
    }
  }

  return null;
}
