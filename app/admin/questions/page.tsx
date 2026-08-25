import { getAllQuestions, getAllSubjects } from "@/lib/queries/admin-questions";
import { QuestionsTable } from "@/components/admin/questions-table";
import { QuestionFilters } from "@/components/admin/question-filters";
import { AdminButton } from "@/components/admin/admin-button";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * Admin questions management page.
 * Displays all MCQ questions with filters and management options.
 */
export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const subjectId = typeof params.subject === "string" ? params.subject : "";
  const topicId = typeof params.topic === "string" ? params.topic : "";
  const difficulty =
    typeof params.difficulty === "string" ? params.difficulty : "";
  const search = typeof params.search === "string" ? params.search : "";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  // Fetch questions and subjects in parallel
  const [{ questions, total, totalPages }, subjects] = await Promise.all([
    getAllQuestions({
      subjectId,
      topicId,
      difficulty,
      search,
      page,
    }),
    getAllSubjects(),
  ]);

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-black md:text-4xl">
            Questions Management
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant md:text-base">
            Manage MCQ questions across all subjects and chapters
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="border-2 border-black bg-brand-fixed px-4 py-2 shadow-hard-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Total Questions
            </p>
            <p className="font-headline text-2xl font-bold text-black">
              {total.toLocaleString()}
            </p>
          </div>
          <AdminButton href="/admin/questions/new" icon="add" variant="primary" size="sm" className="md:text-base">
            Add Question
          </AdminButton>
        </div>
      </div>

      {/* Filters */}
      <QuestionFilters
        initialSubject={subjectId}
        initialTopic={topicId}
        initialDifficulty={difficulty}
        initialSearch={search}
        subjects={subjects}
      />

      {/* Questions Table */}
      <div className="overflow-x-auto border-2 border-black bg-white shadow-hard">
        <QuestionsTable
          questions={questions}
          currentPage={page}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
