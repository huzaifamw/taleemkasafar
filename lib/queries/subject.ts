import { getActiveEntryTest } from "./entry-test";
import {
  getSubjectsCached,
  getChaptersCached,
  type ChapterOverview,
} from "./catalog";
import { sumQuestionCounts } from "./dashboard-helpers";

export type { ChapterOverview };

export type SubjectPageData = {
  entryTestSlug: string;
  entryTestName: string;
  subjectSlug: string;
  subjectName: string;
  chapters: ChapterOverview[];
  totalQuestions: number;
};

/**
 * Loads a subject page (chapters list) for the user's active entry test.
 * Active-test resolution is user-specific (dynamic); the subject + chapter
 * data is read from the cached catalog. Returns null if the subject isn't part
 * of the active test.
 */
export async function getSubjectPage(
  subjectSlug: string,
): Promise<SubjectPageData | null> {
  const entryTest = await getActiveEntryTest();
  if (!entryTest) return null;

  const subjects = await getSubjectsCached(entryTest.slug);
  const subject = subjects.find((s) => s.subject_slug === subjectSlug);
  if (!subject) return null;

  const catalogChapters = await getChaptersCached(entryTest.slug, subjectSlug);
  // PU's catalog contains placeholder topics that do not have approved MCQs
  // yet. Keep them out of the student-facing topic list until content exists.
  const chapters =
    entryTest.slug === "pu"
      ? catalogChapters.filter((chapter) => (chapter.question_count ?? 0) > 0)
      : catalogChapters;
  const totalQuestions = sumQuestionCounts(chapters);

  return {
    entryTestSlug: entryTest.slug,
    entryTestName: entryTest.name,
    subjectSlug: subject.subject_slug ?? subjectSlug,
    subjectName: subject.subject_name ?? subjectSlug,
    chapters,
    totalQuestions,
  };
}
