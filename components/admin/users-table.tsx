"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/dashboard/icon";
import { AdminButton } from "./admin-button";
import type { AdminUser } from "@/lib/queries/admin-users";
import {
  banUser,
  unbanUser,
  deleteUser,
  sendPasswordReset,
} from "@/app/admin/users/actions";

type UsersTableProps = {
  users: AdminUser[];
  currentPage: number;
  totalPages: number;
};

/**
 * Table displaying all users with management actions.
 * Soft Brutalist design matching admin panel aesthetic.
 */
export function UsersTable({
  users,
  currentPage,
  totalPages,
}: UsersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actioningUserId, setActioningUserId] = useState<string | null>(null);

  const handleBan = async (userId: string) => {
    if (!confirm("Ban this user for 30 days?")) return;

    setActioningUserId(userId);
    const result = await banUser(userId, 30);

    if (result.success) {
      startTransition(() => router.refresh());
    } else {
      alert(`Failed to ban user: ${result.error}`);
    }
    setActioningUserId(null);
  };

  const handleUnban = async (userId: string) => {
    setActioningUserId(userId);
    const result = await unbanUser(userId);

    if (result.success) {
      startTransition(() => router.refresh());
    } else {
      alert(`Failed to unban user: ${result.error}`);
    }
    setActioningUserId(null);
  };

  const handleDelete = async (userId: string, email: string) => {
    if (
      !confirm(
        `PERMANENTLY DELETE user ${email}?\n\nThis action cannot be undone and will delete:\n- User account\n- All attempts and progress\n- All bookmarks\n\nType DELETE to confirm`
      )
    ) {
      return;
    }

    setActioningUserId(userId);
    const result = await deleteUser(userId);

    if (result.success) {
      startTransition(() => router.refresh());
    } else {
      alert(`Failed to delete user: ${result.error}`);
    }
    setActioningUserId(null);
  };

  const handlePasswordReset = async (email: string) => {
    if (!confirm(`Send password reset email to ${email}?`)) return;

    setActioningUserId(email);
    const result = await sendPasswordReset(email);

    if (result.success) {
      alert("Password reset email sent successfully");
    } else {
      alert(`Failed to send reset email: ${result.error}`);
    }
    setActioningUserId(null);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`);
    });
  };

  if (users.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-on-surface-variant">
        No users found
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b-2 border-black bg-brand-fixed">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-black">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-black">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-black">
                Stats
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-black">
                Joined
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-black">
                Last Sign In
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-black">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-surface-container bg-white">
            {users.map((user) => {
              const isBanned = user.banned_until
                ? new Date(user.banned_until) > new Date()
                : false;
              const isActioning = actioningUserId === user.id;

              return (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-surface-container"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-headline text-sm font-bold text-black">
                        {user.email}
                      </div>
                      {user.display_name && (
                        <div className="text-sm text-on-surface-variant">
                          {user.display_name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isBanned ? (
                      <span className="inline-flex items-center gap-1 border-2 border-black bg-danger px-2 py-1 text-xs font-bold text-white">
                        <Icon name="block" className="text-sm" />
                        Banned
                      </span>
                    ) : user.email_confirmed_at ? (
                      <span className="inline-flex items-center gap-1 border-2 border-black bg-green-100 px-2 py-1 text-xs font-bold text-green-800">
                        <Icon name="check_circle" className="text-sm" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 border-2 border-black bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-800">
                        <Icon name="schedule" className="text-sm" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    <div className="font-bold text-black">
                      {user.total_attempts || 0} attempts
                    </div>
                    <div className="text-xs">{user.total_mocks || 0} mocks</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      {isBanned ? (
                        <button
                          onClick={() => handleUnban(user.id)}
                          disabled={isActioning || isPending}
                          className="border-2 border-black bg-white px-3 py-1 text-sm font-bold text-green-600 transition-all hover:-translate-y-0.5 hover:bg-green-600 hover:text-white hover:shadow-hard-sm disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBan(user.id)}
                          disabled={isActioning || isPending}
                          className="border-2 border-black bg-white px-3 py-1 text-sm font-bold text-orange-600 transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:text-white hover:shadow-hard-sm disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                          Ban
                        </button>
                      )}
                      <button
                        onClick={() => handlePasswordReset(user.email)}
                        disabled={isActioning || isPending}
                        className="border-2 border-black bg-white px-3 py-1 text-sm font-bold text-brand transition-all hover:-translate-y-0.5 hover:bg-brand hover:text-white hover:shadow-hard-sm disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.email)}
                        disabled={isActioning || isPending}
                        className="border-2 border-black bg-white px-3 py-1 text-sm font-bold text-danger transition-all hover:-translate-y-0.5 hover:bg-danger hover:text-white hover:shadow-hard-sm disabled:opacity-50 disabled:hover:translate-y-0"
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
        <div className="flex items-center justify-between border-t-2 border-black bg-surface-container px-6 py-4">
          <div className="text-sm font-bold text-on-surface-variant">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isPending}
              icon="chevron_left"
            >
              Previous
            </AdminButton>
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isPending}
              icon="chevron_right"
            >
              Next
            </AdminButton>
          </div>
        </div>
      )}
    </div>
  );
}
