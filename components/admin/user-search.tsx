"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type UserSearchProps = {
  initialSearch: string;
};

/**
 * Search bar for filtering users by email or name.
 */
export function UserSearch({ initialSearch }: UserSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    params.delete("page"); // Reset to page 1 on new search

    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setSearch("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");

    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-3">
      <div className="relative flex-1">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name..."
          className="w-full border-2 border-black px-4 py-2.5 font-body focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50"
          disabled={isPending}
        />
        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-black"
          >
            ✕
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="border-2 border-black bg-brand px-6 py-2.5 font-headline font-bold text-white shadow-hard transition-all hover:-translate-y-0.5 hover:shadow-hard-primary disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isPending ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
