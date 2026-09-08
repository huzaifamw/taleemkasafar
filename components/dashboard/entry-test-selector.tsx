"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { selectEntryTest } from "@/app/(dashboard)/actions";
import { Icon } from "./icon";
import type { EntryTest } from "@/lib/queries/entry-test";

/**
 * Header-center entry-test picker. Persists the choice via a Server Action,
 * then refreshes so server data re-loads for the new test.
 */
export function EntryTestSelector({
  tests,
  activeId,
}: {
  tests: EntryTest[];
  activeId: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [optimisticActiveId, setOptimisticActiveId] = useOptimistic(activeId);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const active = tests.find((t) => t.id === optimisticActiveId) ?? tests[0];
  if (!active) return null;

  const choose = (id: string) => {
    setOpen(false);
    setError(null);
    if (id === optimisticActiveId) return;
    startTransition(async () => {
      setOptimisticActiveId(id);
      const result = await selectEntryTest(id);
      if (!result.success) {
        setError(result.error ?? "Unable to switch entry test.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 border-2 border-black bg-white px-4 py-2 font-headline text-sm font-bold uppercase tracking-tight transition-colors hover:bg-surface-container disabled:opacity-60"
      >
        <Icon name="school" className="text-lg text-brand" filled />
        <span className="max-w-[10rem] truncate">{active.name}</span>
        <Icon name={open ? "expand_less" : "expand_more"} className="text-lg" />
      </button>

      {error && (
        <p
          role="alert"
          className="absolute left-1/2 top-full z-30 mt-2 w-64 -translate-x-1/2 border-2 border-danger bg-red-50 px-3 py-2 text-xs font-bold text-danger shadow-hard-sm"
        >
          {error}
        </p>
      )}

      {open && (
        <>
          {/* click-away backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <ul
            role="listbox"
            className="absolute left-1/2 z-20 mt-2 w-64 -translate-x-1/2 border-2 border-black bg-white shadow-hard"
          >
            {tests.map((t) => {
              const selected = t.id === optimisticActiveId;
              return (
                <li key={t.id} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => choose(t.id)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left font-headline text-sm font-bold uppercase tracking-tight transition-colors ${
                      selected
                        ? "bg-brand-fixed text-[#001a42]"
                        : "hover:bg-surface-container"
                    }`}
                  >
                    {t.name}
                    {selected && <Icon name="check" className="text-lg" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
