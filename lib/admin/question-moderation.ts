import type { Database } from "@/lib/database.types";

export type QuestionModerationStatus =
  Database["public"]["Enums"]["moderation_status"];

export const QUESTION_MODERATION = {
  approve: "approved",
  reject: "flagged",
  draft: "draft",
} as const satisfies Record<string, QuestionModerationStatus>;

const STATUS_LABELS: Record<QuestionModerationStatus, string> = {
  approved: "Approved",
  flagged: "Rejected",
  draft: "Draft",
};

export function getQuestionModerationLabel(
  status: QuestionModerationStatus,
): string {
  return STATUS_LABELS[status];
}
