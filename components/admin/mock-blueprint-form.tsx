"use client";

import { useMemo, useState, useTransition } from "react";
import { saveMockBlueprint } from "@/app/admin/entry-tests/actions";
import {
  validateMockBlueprint,
  type MockBlueprintInput,
  type MockScoringMode,
} from "@/lib/admin/mock-blueprint";
import type { AdminMockBlueprint } from "@/lib/queries/admin-entry-tests";

type TestSubject = {
  id: string;
  subject_name?: string;
};

type SlotState = {
  enabled: boolean;
  testSubjectId: string;
  subjectName: string;
  questionCount: number;
  pastPaperCount: number;
  practiceCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  weightPercent: number;
  sectionDurationMinutes: number;
  displayOrder: number;
};

type Props = {
  entryTestId: string;
  blueprint?: AdminMockBlueprint;
  testSubjects: TestSubject[];
  onCancel: () => void;
  onSaved: () => void;
};

function numericValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function difficultyCount(value: unknown, key: "easy" | "medium" | "hard") {
  if (!value || typeof value !== "object" || Array.isArray(value)) return 0;
  const result = Number((value as Record<string, unknown>)[key]);
  return Number.isFinite(result) ? result : 0;
}

export function MockBlueprintForm({
  entryTestId,
  blueprint,
  testSubjects,
  onCancel,
  onSaved,
}: Props) {
  const [name, setName] = useState(blueprint?.name ?? "");
  const [description, setDescription] = useState(blueprint?.description ?? "");
  const [durationMinutes, setDurationMinutes] = useState(
    blueprint ? blueprint.duration_seconds / 60 : 100,
  );
  const [totalQuestions, setTotalQuestions] = useState(
    blueprint?.total_questions ?? 100,
  );
  const [scoringMode, setScoringMode] = useState<MockScoringMode>(
    blueprint?.scoring_mode === "section_weighted"
      ? "section_weighted"
      : "uniform",
  );
  const [marksPerCorrect, setMarksPerCorrect] = useState(
    Number(blueprint?.marks_per_correct ?? 1),
  );
  const [marksPerIncorrect, setMarksPerIncorrect] = useState(
    Number(blueprint?.marks_per_incorrect ?? 0),
  );
  const [marksPerUnanswered, setMarksPerUnanswered] = useState(
    Number(blueprint?.marks_per_unanswered ?? 0),
  );
  const [isActive, setIsActive] = useState(blueprint?.is_active ?? true);
  const [displayOrder, setDisplayOrder] = useState(blueprint?.display_order ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [slots, setSlots] = useState<SlotState[]>(() =>
    testSubjects.map((subject, index) => {
      const existing = blueprint?.mock_blueprint_slots.find(
        (slot) => slot.test_subject_id === subject.id,
      );
      const questionCount = existing?.question_count ?? 0;
      const pastPaperCount = existing?.past_paper_min ?? 0;
      return {
        enabled: Boolean(existing),
        testSubjectId: subject.id,
        subjectName: subject.subject_name ?? "Unnamed subject",
        questionCount,
        pastPaperCount,
        practiceCount: existing?.practice_max ?? questionCount - pastPaperCount,
        easyCount: difficultyCount(existing?.difficulty_mix, "easy"),
        mediumCount: difficultyCount(existing?.difficulty_mix, "medium"),
        hardCount: difficultyCount(existing?.difficulty_mix, "hard"),
        weightPercent: Number(existing?.weight_percent ?? 0),
        sectionDurationMinutes: Number(
          (existing?.section_duration_seconds ?? 0) / 60,
        ),
        displayOrder: existing?.display_order ?? index,
      };
    }),
  );

  const selectedSlots = useMemo(() => slots.filter((slot) => slot.enabled), [slots]);
  const summary = useMemo(
    () =>
      selectedSlots.reduce(
        (totals, slot) => ({
          questions: totals.questions + slot.questionCount,
          past: totals.past + slot.pastPaperCount,
          practice: totals.practice + slot.practiceCount,
          easy: totals.easy + slot.easyCount,
          medium: totals.medium + slot.mediumCount,
          hard: totals.hard + slot.hardCount,
          weight: totals.weight + slot.weightPercent,
          minutes: totals.minutes + slot.sectionDurationMinutes,
        }),
        {
          questions: 0,
          past: 0,
          practice: 0,
          easy: 0,
          medium: 0,
          hard: 0,
          weight: 0,
          minutes: 0,
        },
      ),
    [selectedSlots],
  );

  const updateSlot = (index: number, patch: Partial<SlotState>) => {
    setSlots((current) =>
      current.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, ...patch } : slot,
      ),
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const input: MockBlueprintInput = {
      id: blueprint?.id,
      entryTestId,
      name,
      description,
      durationSeconds: durationMinutes * 60,
      totalQuestions,
      scoringMode,
      marksPerCorrect,
      marksPerIncorrect,
      marksPerUnanswered,
      isActive,
      displayOrder,
      slots: selectedSlots.map((slot, index) => ({
        testSubjectId: slot.testSubjectId,
        subjectName: slot.subjectName,
        questionCount: slot.questionCount,
        pastPaperCount: slot.pastPaperCount,
        practiceCount: slot.practiceCount,
        easyCount: slot.easyCount,
        mediumCount: slot.mediumCount,
        hardCount: slot.hardCount,
        weightPercent:
          scoringMode === "section_weighted" ? slot.weightPercent : null,
        sectionDurationSeconds:
          scoringMode === "section_weighted"
            ? slot.sectionDurationMinutes * 60
            : null,
        displayOrder: index,
      })),
    };

    const validationError = validateMockBlueprint(input);
    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      const result = await saveMockBlueprint(input);
      if (!result.success) {
        setError(result.error ?? "Unable to save the blueprint.");
        return;
      }
      onSaved();
    });
  };

  const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-purple-200 bg-purple-50/40 p-5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {blueprint ? "Edit mock blueprint" : "Create mock blueprint"}
          </h3>
          <p className="text-sm text-gray-600">
            Define the test, scoring, subjects, sources and difficulty distribution.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="self-start text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
        >
          Close
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-gray-700">
          Blueprint name
          <input
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
            placeholder="e.g. Full engineering mock"
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Scoring mode
          <select
            value={scoringMode}
            onChange={(event) => setScoringMode(event.target.value as MockScoringMode)}
            className={inputClass}
          >
            <option value="uniform">Uniform marks</option>
            <option value="section_weighted">Section weighted</option>
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700 md:col-span-2">
          Description
          <textarea
            rows={2}
            maxLength={1000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={inputClass}
            placeholder="Explain who this mock is for and what it covers."
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Duration (minutes)
          <input type="number" min={1} max={1440} step={1} value={durationMinutes} onChange={(event) => setDurationMinutes(numericValue(event.target.value))} className={inputClass} />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Total questions
          <input type="number" min={1} max={1000} step={1} value={totalQuestions} onChange={(event) => setTotalQuestions(numericValue(event.target.value))} className={inputClass} />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Marks per correct answer
          <input type="number" min={-100} max={100} step="0.01" value={marksPerCorrect} onChange={(event) => setMarksPerCorrect(numericValue(event.target.value))} className={inputClass} />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Marks per incorrect answer
          <input type="number" min={-100} max={100} step="0.01" value={marksPerIncorrect} onChange={(event) => setMarksPerIncorrect(numericValue(event.target.value))} className={inputClass} />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Marks per unanswered question
          <input type="number" min={-100} max={100} step="0.01" value={marksPerUnanswered} onChange={(event) => setMarksPerUnanswered(numericValue(event.target.value))} className={inputClass} />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Display order
          <input type="number" step={1} value={displayOrder} onChange={(event) => setDisplayOrder(numericValue(event.target.value))} className={inputClass} />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 md:col-span-2">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-purple-600" />
          Make this blueprint available to students
        </label>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-gray-900">Subject slots</h4>
          <p className="text-sm text-gray-600">
            Every enabled row must balance its source and difficulty counts with its question total.
          </p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-[1050px] w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-3 py-3">Use</th>
                <th className="px-3 py-3">Subject</th>
                <th className="px-2 py-3">Total</th>
                <th className="px-2 py-3">Past paper</th>
                <th className="px-2 py-3">Practice</th>
                <th className="px-2 py-3">Easy</th>
                <th className="px-2 py-3">Medium</th>
                <th className="px-2 py-3">Hard</th>
                {scoringMode === "section_weighted" && <th className="px-2 py-3">Weight %</th>}
                {scoringMode === "section_weighted" && <th className="px-2 py-3">Minutes</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {slots.map((slot, index) => (
                <tr key={slot.testSubjectId} className={slot.enabled ? "bg-white" : "bg-gray-50/70 text-gray-400"}>
                  <td className="px-3 py-3">
                    <input type="checkbox" checked={slot.enabled} onChange={(event) => updateSlot(index, { enabled: event.target.checked })} className="h-4 w-4 rounded border-gray-300 text-purple-600" aria-label={`Include ${slot.subjectName}`} />
                  </td>
                  <td className="px-3 py-3 font-medium whitespace-nowrap">{slot.subjectName}</td>
                  {(["questionCount", "pastPaperCount", "practiceCount", "easyCount", "mediumCount", "hardCount"] as const).map((field) => (
                    <td key={field} className="px-2 py-2">
                      <input type="number" min={0} step={1} disabled={!slot.enabled} value={slot[field]} onChange={(event) => updateSlot(index, { [field]: numericValue(event.target.value) })} className="w-20 rounded border border-gray-300 px-2 py-1.5 text-gray-900 disabled:bg-gray-100" />
                    </td>
                  ))}
                  {scoringMode === "section_weighted" && (
                    <td className="px-2 py-2">
                      <input type="number" min={0} max={100} step="0.01" disabled={!slot.enabled} value={slot.weightPercent} onChange={(event) => updateSlot(index, { weightPercent: numericValue(event.target.value) })} className="w-20 rounded border border-gray-300 px-2 py-1.5 text-gray-900 disabled:bg-gray-100" />
                    </td>
                  )}
                  {scoringMode === "section_weighted" && (
                    <td className="px-2 py-2">
                      <input type="number" min={1} step={1} disabled={!slot.enabled} value={slot.sectionDurationMinutes} onChange={(event) => updateSlot(index, { sectionDurationMinutes: numericValue(event.target.value) })} className="w-20 rounded border border-gray-300 px-2 py-1.5 text-gray-900 disabled:bg-gray-100" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div><span className="text-gray-500">Allocated questions</span><p className={summary.questions === totalQuestions ? "font-semibold text-green-700" : "font-semibold text-red-700"}>{summary.questions} / {totalQuestions}</p></div>
        <div><span className="text-gray-500">Sources</span><p className="font-semibold text-gray-900">{summary.past} past + {summary.practice} practice</p></div>
        <div><span className="text-gray-500">Difficulty</span><p className="font-semibold text-gray-900">{summary.easy} easy · {summary.medium} medium · {summary.hard} hard</p></div>
        {scoringMode === "section_weighted" ? (
          <div><span className="text-gray-500">Sections</span><p className="font-semibold text-gray-900">{summary.weight}% · {summary.minutes}/{durationMinutes} min</p></div>
        ) : (
          <div><span className="text-gray-500">Maximum marks</span><p className="font-semibold text-gray-900">{totalQuestions * marksPerCorrect}</p></div>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={isPending} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
        <button type="submit" disabled={isPending} className="rounded-md bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60">
          {isPending ? "Validating and saving…" : blueprint ? "Save blueprint" : "Create blueprint"}
        </button>
      </div>
    </form>
  );
}
