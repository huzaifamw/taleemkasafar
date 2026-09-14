import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/queries/dashboard";
import { DashboardHeader } from "@/components/dashboard/header";
import { SubjectsSection } from "@/components/dashboard/subjects-section";
import Link from "next/link";
import { Icon } from "@/components/dashboard/icon";

export default function SubjectsPage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <SubjectsView />
    </Suspense>
  );
}

async function SubjectsView() {
  const data = await getDashboardData();
  if (!data) redirect("/auth/login");

  return (
    <>
      <DashboardHeader
        title="My Subjects"
        badge={data.entryTest.name}
        displayName={data.displayName}
        tests={data.tests}
        activeTestId={data.entryTest.id}
      />
      <main className="px-6 pb-24 pt-28 md:px-8 md:pb-20">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/subjects/bookmarks"
            className="group mb-10 flex flex-col justify-between gap-5 border-[3px] border-black bg-brand-fixed p-6 shadow-hard transition-transform hover:-translate-y-1 sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center border-2 border-black bg-white">
                <Icon name="bookmarks" className="text-3xl" />
              </div>
              <div>
                <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">
                  Bookmarked Questions
                </h2>
                <p className="mt-1 text-sm font-medium text-on-surface-variant">
                  Review questions saved from subject practice and past papers.
                </p>
              </div>
            </div>
            <span className="flex items-center gap-2 font-headline text-sm font-bold uppercase">
              Open saved questions
              <Icon name="arrow_forward" className="transition-transform group-hover:translate-x-2" />
            </span>
          </Link>
          <SubjectsSection subjects={data.subjects} />
        </div>
      </main>
    </>
  );
}

function Skeleton() {
  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-30 h-20 border-b-2 border-black bg-white md:left-64" />
      <main className="px-6 pb-24 pt-28 md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse border-2 border-black bg-surface-container"
            />
          ))}
        </div>
      </main>
    </>
  );
}
