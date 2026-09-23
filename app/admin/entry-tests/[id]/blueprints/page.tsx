import { getEntryTestById } from "@/lib/queries/admin-entry-tests";
import { MockBlueprintsList } from "@/components/admin/mock-blueprints-list";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Mock test blueprints configuration page.
 * Allows admins to create and manage mock test configurations for an entry test.
 */
export default async function MockBlueprintsPage({ params }: PageProps) {
  noStore();
  
  const { id } = await params;
  const entryTest = await getEntryTestById(id);

  if (!entryTest) {
    notFound();
  }

  const activeTestSubjects = (entryTest.test_subjects || []).filter(
    (subject) => subject.is_active,
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/admin/entry-tests" className="hover:text-blue-600">
          Entry Tests
        </Link>
        <span>/</span>
        <Link href={`/admin/entry-tests/${id}/edit`} className="hover:text-blue-600">
          {entryTest.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">Mock Blueprints</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mock Test Blueprints</h1>
          <p className="text-gray-600 mt-2">
            Configure mock test patterns for {entryTest.name}
          </p>
        </div>
        <Link
          href={`/admin/entry-tests/${id}/edit`}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
        >
          ← Back to Edit
        </Link>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-xl">ℹ️</div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">About Mock Blueprints</h3>
            <p className="text-sm text-blue-800">
              Mock blueprints define the structure of mock tests - how many questions from each subject,
              difficulty distribution, and question sources (past papers vs practice).
              Each blueprint can be used to generate multiple mock test attempts.
            </p>
          </div>
        </div>
      </div>

      {/* Prerequisites Check */}
      {activeTestSubjects.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 mb-4">
            ⚠️ You need to assign subjects to this entry test before creating mock blueprints.
          </p>
          <Link
            href={`/admin/entry-tests/${id}/edit`}
            className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            Assign Subjects
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Assigned Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{activeTestSubjects.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Total Questions Available</p>
              <p className="text-2xl font-bold text-gray-900">{entryTest.questions_count || 0}</p>
            </div>
          </div>

          {/* Mock Blueprints List */}
          <div className="bg-white rounded-lg shadow p-6">
            <MockBlueprintsList
              entryTestId={id}
              blueprints={entryTest.mock_blueprints || []}
              testSubjects={activeTestSubjects}
            />
          </div>
        </>
      )}
    </div>
  );
}
