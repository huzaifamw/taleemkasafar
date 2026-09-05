"use client";

import { useState } from "react";
import type { Database } from "@/lib/database.types";

type MockBlueprint = Database["public"]["Tables"]["mock_test_blueprints"]["Row"];
type TestSubject = {
  id: string;
  subject_name?: string;
};

type MockBlueprintsListProps = {
  entryTestId: string;
  blueprints: MockBlueprint[];
  testSubjects: TestSubject[];
};

export function MockBlueprintsList({
  entryTestId,
  blueprints,
  testSubjects,
}: MockBlueprintsListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Mock Test Configurations</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
        >
          {showCreateForm ? "Cancel" : "+ Create Blueprint"}
        </button>
      </div>

      {showCreateForm && (
        <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
          <p className="text-sm text-purple-800 mb-2">
            🚧 Blueprint creation form coming soon. This will allow you to:
          </p>
          <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
            <li>Define test name and duration</li>
            <li>Set total number of questions</li>
            <li>Configure question distribution per subject</li>
            <li>Set difficulty mix (easy/medium/hard)</li>
            <li>Define past paper vs practice question ratios</li>
          </ul>
        </div>
      )}

      {blueprints.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-lg mb-2">No mock blueprints configured yet</p>
          <p className="text-sm mb-4">
            Create a blueprint to define mock test patterns for this entry test
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Create Your First Blueprint →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blueprints.map((blueprint) => (
            <div
              key={blueprint.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{blueprint.name}</h3>
                  {blueprint.description && (
                    <p className="text-sm text-gray-600 mt-1">{blueprint.description}</p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    blueprint.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {blueprint.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-semibold text-gray-900">
                    {formatDuration(blueprint.duration_seconds)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Questions</p>
                  <p className="font-semibold text-gray-900">{blueprint.total_questions}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Marks</p>
                  <p className="font-semibold text-gray-900">
                    {blueprint.total_questions * Number(blueprint.marks_per_correct)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2">
                <button className="text-sm text-blue-600 hover:text-blue-900">
                  Configure Slots
                </button>
                <button className="text-sm text-purple-600 hover:text-purple-900">
                  Edit
                </button>
                <button className="text-sm text-red-600 hover:text-red-900">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      {blueprints.length > 0 && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600">
            Each blueprint can have multiple "slots" that define how questions are distributed
            across subjects. Click "Configure Slots" on a blueprint to set up the question
            distribution.
          </p>
        </div>
      )}
    </div>
  );
}
