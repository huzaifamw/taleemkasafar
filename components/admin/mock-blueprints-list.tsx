"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteMockBlueprint,
  toggleMockBlueprintActive,
} from "@/app/admin/entry-tests/actions";
import { MockBlueprintForm } from "@/components/admin/mock-blueprint-form";
import type { AdminMockBlueprint } from "@/lib/queries/admin-entry-tests";

type TestSubject = { id: string; subject_name?: string };

type MockBlueprintsListProps = {
  entryTestId: string;
  blueprints: AdminMockBlueprint[];
  testSubjects: TestSubject[];
};

type FormState =
  | { mode: "create" }
  | { mode: "edit"; blueprint: AdminMockBlueprint }
  | null;

export function MockBlueprintsList({
  entryTestId,
  blueprints,
  testSubjects,
}: MockBlueprintsListProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours === 0) return `${minutes}m`;
    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
  };

  const finishSave = () => {
    setForm(null);
    setActionError(null);
    router.refresh();
  };

  const handleToggle = (blueprint: AdminMockBlueprint) => {
    setActionError(null);
    startTransition(async () => {
      const result = await toggleMockBlueprintActive(
        blueprint.id,
        entryTestId,
        !blueprint.is_active,
      );
      if (!result.success) {
        setActionError(result.error ?? "Unable to update the blueprint.");
        return;
      }
      router.refresh();
    });
  };

  const handleDelete = (blueprintId: string) => {
    setActionError(null);
    startTransition(async () => {
      const result = await deleteMockBlueprint(blueprintId, entryTestId);
      if (!result.success) {
        setActionError(result.error ?? "Unable to delete the blueprint.");
        return;
      }
      setConfirmDeleteId(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Mock Test Configurations</h2>
          <p className="mt-1 text-sm text-gray-600">
            Create validated patterns used to generate student mock attempts.
          </p>
        </div>
        <button
          onClick={() => {
            setActionError(null);
            setForm(form?.mode === "create" ? null : { mode: "create" });
          }}
          className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
        >
          {form?.mode === "create" ? "Cancel" : "+ Create Blueprint"}
        </button>
      </div>

      {actionError && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {actionError}
        </div>
      )}

      {form && (
        <MockBlueprintForm
          key={form.mode === "edit" ? form.blueprint.id : "new"}
          entryTestId={entryTestId}
          blueprint={form.mode === "edit" ? form.blueprint : undefined}
          testSubjects={testSubjects}
          onCancel={() => setForm(null)}
          onSaved={finishSave}
        />
      )}

      {blueprints.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 py-12 text-center text-gray-500">
          <p className="mb-2 text-lg">No mock blueprints configured yet</p>
          <p className="mb-4 text-sm">Create a blueprint to define the mock pattern for this entry test.</p>
          {!form && (
            <button onClick={() => setForm({ mode: "create" })} className="font-medium text-purple-600 hover:text-purple-700">
              Create your first blueprint →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {blueprints.map((blueprint) => {
            const slotCount = blueprint.mock_blueprint_slots.length;
            const pastPaperCount = blueprint.mock_blueprint_slots.reduce(
              (sum, slot) => sum + slot.past_paper_min,
              0,
            );
            const practiceCount = blueprint.mock_blueprint_slots.reduce(
              (sum, slot) => sum + (slot.practice_max ?? slot.question_count - slot.past_paper_min),
              0,
            );
            const isConfirmingDelete = confirmDeleteId === blueprint.id;

            return (
              <article key={blueprint.id} className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{blueprint.name}</h3>
                    {blueprint.description && <p className="mt-1 line-clamp-2 text-sm text-gray-600">{blueprint.description}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${blueprint.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                    {blueprint.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div><dt className="text-gray-500">Duration</dt><dd className="font-semibold text-gray-900">{formatDuration(blueprint.duration_seconds)}</dd></div>
                  <div><dt className="text-gray-500">Questions</dt><dd className="font-semibold text-gray-900">{blueprint.total_questions}</dd></div>
                  <div><dt className="text-gray-500">Subjects</dt><dd className="font-semibold text-gray-900">{slotCount}</dd></div>
                  <div><dt className="text-gray-500">Scoring</dt><dd className="font-semibold text-gray-900">{blueprint.scoring_mode === "section_weighted" ? "Weighted" : "Uniform"}</dd></div>
                </dl>

                <div className="mt-4 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
                  Source mix: <span className="font-medium text-gray-800">{pastPaperCount} past paper</span> · <span className="font-medium text-gray-800">{practiceCount} practice</span>
                </div>

                {isConfirmingDelete ? (
                  <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
                    <p className="text-sm text-red-800">Delete this blueprint and all of its slots? Blueprints already used for attempts cannot be deleted.</p>
                    <div className="mt-3 flex justify-end gap-2">
                      <button type="button" disabled={isPending} onClick={() => setConfirmDeleteId(null)} className="rounded px-3 py-1.5 text-sm text-gray-700 hover:bg-white disabled:opacity-50">Cancel</button>
                      <button type="button" disabled={isPending} onClick={() => handleDelete(blueprint.id)} className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{isPending ? "Deleting…" : "Confirm delete"}</button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap justify-end gap-x-4 gap-y-2 border-t border-gray-200 pt-4">
                    <button type="button" disabled={isPending} onClick={() => setForm({ mode: "edit", blueprint })} className="text-sm font-medium text-blue-600 hover:text-blue-900 disabled:opacity-50">Configure slots</button>
                    <button type="button" disabled={isPending} onClick={() => setForm({ mode: "edit", blueprint })} className="text-sm font-medium text-purple-600 hover:text-purple-900 disabled:opacity-50">Edit</button>
                    <button type="button" disabled={isPending} onClick={() => handleToggle(blueprint)} className="text-sm font-medium text-amber-700 hover:text-amber-900 disabled:opacity-50">{blueprint.is_active ? "Deactivate" : "Activate"}</button>
                    <button type="button" disabled={isPending} onClick={() => setConfirmDeleteId(blueprint.id)} className="text-sm font-medium text-red-600 hover:text-red-900 disabled:opacity-50">Delete</button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {blueprints.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-900">Configuration safety</h3>
          <p className="mt-1 text-sm text-blue-800">
            All slot totals and relationships are validated before saving. A blueprint with generated attempts cannot be structurally edited or deleted; deactivate it and create a replacement instead.
          </p>
        </div>
      )}
    </div>
  );
}
