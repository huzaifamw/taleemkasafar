import { getAllUsers } from "@/lib/queries/admin-users";
import { UsersTable } from "@/components/admin/users-table";
import { UserSearch } from "@/components/admin/user-search";
import { unstable_noStore as noStore } from "next/cache";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * Admin users management page.
 * Displays all users with search, filter, and management options.
 */
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  noStore(); // Opt out of caching for dynamic data
  
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  const { users, total, totalPages } = await getAllUsers(search, page);

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-black md:text-4xl">
            User Management
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant md:text-base">
            View and manage all registered users
          </p>
        </div>
        <div className="border-2 border-black bg-brand-fixed px-4 py-2 shadow-hard-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Total Users
          </p>
          <p className="font-headline text-2xl font-bold text-black">
            {total.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <UserSearch initialSearch={search} />

      {/* Users Table */}
      <div className="overflow-x-auto border-2 border-black bg-white shadow-hard">
        <UsersTable users={users} currentPage={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
