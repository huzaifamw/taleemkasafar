import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { BookmarkedQuestions } from "@/components/dashboard/bookmarked-questions";
import { Icon } from "@/components/dashboard/icon";
import { getDashboardData } from "@/lib/queries/dashboard";
import { getBookmarkedQuestions } from "@/lib/queries/bookmarks";

export default function BookmarksPage() {
  return (
    <Suspense fallback={<BookmarksSkeleton />}>
      <BookmarksView />
    </Suspense>
  );
}

async function BookmarksView() {
  const [dashboard, questions] = await Promise.all([
    getDashboardData(),
    getBookmarkedQuestions(),
  ]);
  if (!dashboard || !questions) redirect("/auth/login");

  return (
    <>
      <DashboardHeader
        title="Saved Questions"
        badge={dashboard.entryTest.name}
        displayName={dashboard.displayName}
        tests={dashboard.tests}
        activeTestId={dashboard.entryTest.id}
      />
      <main className="px-6 pb-24 pt-28 md:px-8 md:pb-20">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/subjects"
            className="mb-6 inline-flex items-center gap-2 font-headline text-sm font-bold uppercase hover:text-brand"
          >
            <Icon name="arrow_back" /> Back to subjects
          </Link>
          <BookmarkedQuestions
            key={dashboard.entryTest.id}
            initialQuestions={questions}
          />
        </div>
      </main>
    </>
  );
}

function BookmarksSkeleton() {
  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-30 h-20 border-b-2 border-black bg-white md:left-64" />
      <main className="px-6 pb-24 pt-28 md:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-20 animate-pulse border-2 border-black bg-surface-container" />
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-64 animate-pulse border-[3px] border-black bg-white" />
          ))}
        </div>
      </main>
    </>
  );
}
