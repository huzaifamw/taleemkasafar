import { getAllEntryTests } from "@/lib/queries/admin-entry-tests";
import { EntryTestsTable } from "@/components/admin/entry-tests-table";
import { AdminButton } from "@/components/admin/admin-button";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Admin entry tests management page.
 * Lists all entry tests with their subject counts and management actions.
 */
export default async function AdminEntryTestsPage() {
  noStore(); // Opt out of caching for dynamic data

  const entryTests = await getAllEntryTests();

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-black md:text-4xl">
            Entry Tests
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant md:text-base">
            Manage entry tests, assign subjects, and configure mock blueprints
          </p>
        </div>
        <AdminButton href="/admin/entry-tests/new" icon="add" variant="primary" size="sm" className="md:text-base">
          Add Entry Test
        </AdminButton>
      </div>

      {/* Entry Tests Table */}
      <div className="overflow-x-auto border-2 border-black bg-white shadow-hard">
        {entryTests.length === 0 ? (
          <div className="p-8 text-center">
            <p className="mb-4 text-on-surface-variant">No entry tests found.</p>
            <AdminButton href="/admin/entry-tests/new" icon="add" variant="primary" size="sm">
              Create your first entry test
            </AdminButton>
          </div>
        ) : (
          <EntryTestsTable entryTests={entryTests} />
        )}
      </div>
    </div>
  );
}
