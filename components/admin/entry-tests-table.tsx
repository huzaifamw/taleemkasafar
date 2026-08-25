"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/dashboard/icon";
import { AdminButton } from "./admin-button";
import { toggleEntryTestActive, deleteEntryTest } from "@/app/admin/entry-tests/actions";
import type { AdminEntryTest } from "@/lib/queries/admin-entry-tests";

type EntryTestsTableProps = {
  entryTests: AdminEntryTest[];
};

/**
 * Entry tests table with Soft Brutalist design.
 */
export function EntryTestsTable({ entryTests }: EntryTestsTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setLoading(id);
    setError(null);

    try {
      const result = await toggleEntryTestActive(id, !currentStatus);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || "Failed to toggle status");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(id);
    setError(null);

    try {
      const result = await deleteEntryTest(id);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || "Failed to delete entry test");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      {error && (
        <div className="m-4 border-2 border-danger bg-red-50 px-4 py-3 text-danger shadow-hard-sm">
          <p className="font-bold">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b-2 border-black bg-brand-fixed">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-black">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-black">
                Slug
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-black">
                Subjects
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-black">
                Questions
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-black">
                Blueprints
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-black">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-black">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-surface-container bg-white">
            {entryTests.map((test) => (
              <tr key={test.id} className="transition-colors hover:bg-surface-container">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-headline text-sm font-bold text-black">{test.name}</div>
                    {test.source && (
                      <div className="text-xs text-on-surface-variant">Source: {test.source}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <code className="border-2 border-black bg-surface-container px-2 py-1 font-mono text-xs text-black">
                    {test.slug}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <Icon name="menu_book" className="text-brand" filled />
                    <span className="font-bold text-black">{test.subjects_count || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <Icon name="quiz" className="text-brand" filled />
                    <span className="font-bold text-black">{test.questions_count || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <Icon name="description" className="text-brand" filled />
                    <span className="font-bold text-black">{test.blueprints_count || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleActive(test.id, test.is_active)}
                    disabled={loading === test.id}
                    className={`inline-flex items-center gap-1 border-2 border-black px-2 py-1 text-xs font-bold transition-all hover:-translate-y-0.5 hover:shadow-hard-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${
                      test.is_active
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    <Icon name={test.is_active ? "check_circle" : "cancel"} className="text-sm" />
                    {test.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      href={`/admin/entry-tests/${test.id}/edit`}
                      className="border-2 border-black bg-white px-3 py-1 text-sm font-bold text-brand transition-all hover:-translate-y-0.5 hover:bg-brand hover:text-white hover:shadow-hard-sm"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/entry-tests/${test.id}/blueprints`}
                      className="border-2 border-black bg-white px-3 py-1 text-sm font-bold text-purple-600 transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:text-white hover:shadow-hard-sm"
                    >
                      Blueprints
                    </Link>
                    <button
                      onClick={() => handleDelete(test.id, test.name)}
                      disabled={loading === test.id}
                      className="border-2 border-black bg-white px-3 py-1 text-sm font-bold text-danger transition-all hover:-translate-y-0.5 hover:bg-danger hover:text-white hover:shadow-hard-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
