import { getEntryTestById, getAllSubjectsForAssignment } from "@/lib/queries/admin-entry-tests";
import { EntryTestForm } from "@/components/admin/entry-test-form";
import { AssignSubjectForm } from "@/components/admin/assign-subject-form";
import { TestSubjectsList } from "@/components/admin/test-subjects-list";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Edit entry test page with subject management.
 */
export default async function EditEntryTestPage({ params }: PageProps) {
  noStore();
  
  const { id } = await params;
  const entryTest = await getEntryTestById(id);

  if (!entryTest) {
    notFound();
  }

  // Get all subjects for assignment
  const allSubjects = await getAllSubjectsForAssignment();
  
  // Filter out already assigned subjects
  const assignedSubjectIds = entryTest.test_subjects?.map((ts) => ts.subject_id) || [];
  const availableSubjects = allSubjects.filter(
    (subject) => !assignedSubjectIds.includes(subject.id)
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/admin/entry-tests" className="hover:text-blue-600">
          Entry Tests
        </Link>
        <span>/</span>
        <span className="text-gray-900">{entryTest.name}</span>
        <span>/</span>
        <span className="text-gray-900">Edit</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Entry Test</h1>
          <p className="text-gray-600 mt-2">
            Update entry test details and manage subjects
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/entry-tests/${id}/blueprints`}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
          >
            Configure Blueprints
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Subjects</p>
          <p className="text-2xl font-bold text-gray-900">{entryTest.subjects_count || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Questions</p>
          <p className="text-2xl font-bold text-gray-900">{entryTest.questions_count || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Mock Blueprints</p>
          <p className="text-2xl font-bold text-gray-900">{entryTest.blueprints_count || 0}</p>
        </div>
      </div>

      {/* Entry Test Details Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Entry Test Details</h2>
        <div className="max-w-2xl">
          <EntryTestForm entryTest={entryTest} mode="edit" />
        </div>
      </div>

      {/* Assigned Subjects */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Assigned Subjects</h2>
          {availableSubjects.length > 0 && (
            <AssignSubjectForm
              entryTestId={id}
              availableSubjects={availableSubjects}
            />
          )}
        </div>

        {entryTest.test_subjects && entryTest.test_subjects.length > 0 ? (
          <TestSubjectsList testSubjects={entryTest.test_subjects as any} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No subjects assigned to this entry test yet.</p>
            {availableSubjects.length > 0 ? (
              <p className="text-sm">Click "Assign Subject" above to add subjects.</p>
            ) : (
              <p className="text-sm text-red-600">No subjects available. Please create subjects first.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
