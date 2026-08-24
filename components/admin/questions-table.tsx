"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminQuestion } from "@/lib/queries/admin-questions";
import {
  deleteQuestion,
  updateQuestionStatus,
} from "@/app/admin/questions/actions";

type QuestionsTableProps = {
  questions: AdminQuestion[];
  currentPage: number;
  totalPages: number;
};

/**
 * Table displaying all MCQ questions with management actions.
 */
export function QuestionsTable({
  questions,
  currentPage,
  totalPages,
}: QuestionsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actioningQuestionId, setActioningQuestionId] = useState<string | null>(
    null
  );
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    null
  );

  const handleDelete = async (questionId: string, statement: string) => {
    const confirmMsg = `Delete this question?\n\n"${statement.substring(0, 100)}${statement.length > 100 ? "..." : ""}"\n\nThis action cannot be undone.`;

    if (!confirm(confirmMsg)) return;

    setActioningQuestionId(questionId);
    const result = await deleteQuestion(questionId);

    if (result.success) {
      startTransition(() => router.refresh());
    } else {
      alert(`Failed to delete question: ${result.error}`);
    }
    setActioningQuestionId(null);
  };

  const handleApprove = async (questionId: string) => {
    setActioningQuestionId(questionId);
    const result = await updateQuestionStatus(questionId, "approved");

    if (result.success) {
      startTransition(() => router.refresh());
    } else {
      alert(`Failed to approve question: ${result.error}`);
    }
    setActioningQuestionId(null);
  };

  const handleReject = async (questionId: string) => {
    const reason = prompt("Rejection reason (optional):");
    if (reason === null) return; // User cancelled

    setActioningQuestionId(questionId);
    const result = await updateQuestionStatus(
      questionId,
      "rejected",
      reason || undefined
    );

    if (result.success) {
      startTransition(() => router.refresh());
    } else {
      alert(`Failed to reject question: ${result.error}`);
    }
    setActioningQuestionId(null);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    startTransition(() => {
      router.push(`/admin/questions?${params.toString()}`);
    });
  };

  const toggleExpand = (questionId: string) => {
    setExpandedQuestionId(expandedQuestionId === questionId ? null : questionId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (questions.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-gray-500">
        No questions found. Try adjusting your filters or create a new question.
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Question
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject / Topic
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {questions.map((question) => {
              const isExpanded = expandedQuestionId === question.id;
              const isActioning = actioningQuestionId === question.id;

              return (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <button
                        onClick={() => toggleExpand(question.id)}
                        className="text-left text-sm text-gray-900 hover:text-blue-600"
                      >
                        {isExpanded
                          ? question.statement
                          : question.statement.substring(0, 80) +
                            (question.statement.length > 80 ? "..." : "")}
                      </button>

                      {isExpanded && question.options && (
                        <div className="mt-3 space-y-2 text-sm">
                          {question.options.map((option) => (
                            <div
                              key={option.id}
                              className={`p-2 rounded border ${
                                option.is_correct
                                  ? "bg-green-50 border-green-300 font-medium"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <span className="font-bold mr-2">
                                {(option as any).label || (option as any).option_label}.
                              </span>
                              {option.content}
                              {option.is_correct && (
                                <span className="ml-2 text-green-600">✓</span>
                              )}
                            </div>
                          ))}
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                              <div className="text-xs font-semibold text-blue-800 mb-1">
                                EXPLANATION:
                              </div>
                              <div className="text-xs text-blue-900">
                                {question.explanation}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {question.subject_name}
                    </div>
                    {question.topic_name && (
                      <div className="text-xs text-gray-500">
                        {question.topic_name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}
                    >
                      {question.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(question.moderation_status)}`}
                    >
                      {question.moderation_status}
                    </span>
                    {question.review_note && (
                      <div className="text-xs text-gray-500 mt-1">
                        {question.review_note}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(question.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {question.moderation_status !== "approved" && (
                        <button
                          onClick={() => handleApprove(question.id)}
                          disabled={isActioning || isPending}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {(question.moderation_status as any) !== "rejected" && (
                        <button
                          onClick={() => handleReject(question.id)}
                          disabled={isActioning || isPending}
                          className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleDelete(question.id, question.statement)
                        }
                        disabled={isActioning || isPending}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isPending}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isPending}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
