import { redirect } from "next/navigation";
import { getLatestAIAnalysis, getAIAnalysisHistory } from "@/lib/queries/insights";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { getEntryTestsCached } from "@/lib/queries/catalog";
import { getDisplayName, getViewerContext } from "@/lib/queries/profile";
import { DashboardHeader } from "@/components/dashboard/header";
import { AIAnalysisCard } from "@/components/insights/ai-analysis-card";
import { StrengthsSection } from "@/components/insights/strengths-section";
import { WeakAreasSection } from "@/components/insights/weak-areas-section";
import { RecommendationsList } from "@/components/insights/recommendations-list";
import { PracticeSuggestions } from "@/components/insights/practice-suggestions";
import { MotivationalMessage } from "@/components/insights/motivational-message";
import { AnalysisTimeline } from "@/components/insights/analysis-timeline";
import { Icon } from "@/components/dashboard/icon";
import Link from "next/link";

export const metadata = {
  title: "AI Performance Insights | Taleem Ka Safar",
  description: "Get personalized AI-powered performance analysis and study recommendations",
};

export default async function InsightsPage() {
  const viewer = await getViewerContext();
  if (!viewer) {
    redirect("/auth/login");
  }

  const [latestAnalysis, analysisHistory, entryTest, tests, displayName] = await Promise.all([
    getLatestAIAnalysis(),
    getAIAnalysisHistory(),
    getActiveEntryTest(),
    getEntryTestsCached(),
    getDisplayName(),
  ]);

  if (!entryTest) {
    redirect("/auth/login");
  }

  return (
    <>
      <DashboardHeader
        title="AI Insights"
        badge={entryTest.name}
        displayName={displayName}
        tests={tests}
        activeTestId={entryTest.id}
      />
      <main className="px-4 pb-24 pt-28 md:px-12 md:pb-20">
        <div className="mx-auto max-w-6xl">
          {latestAnalysis ? (
            <div className="space-y-6">
              {/* Main Analysis Card */}
              <AIAnalysisCard analysis={latestAnalysis} />

              {/* Motivational Message */}
              <MotivationalMessage
                message={latestAnalysis.motivationalMessage}
                performanceTier={latestAnalysis.performanceTier}
              />

              {/* Two Column Layout */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Strengths */}
                <StrengthsSection strengths={latestAnalysis.strengths} />

                {/* Weak Areas */}
                <WeakAreasSection
                  weaknesses={latestAnalysis.weaknesses}
                  weakSubjects={latestAnalysis.weakSubjects}
                  weakTopics={latestAnalysis.weakTopics}
                />
              </div>

              {/* Recommendations */}
              <RecommendationsList
                recommendations={latestAnalysis.studyRecommendations}
              />

              {/* Practice Suggestions */}
              <PracticeSuggestions
                suggestions={latestAnalysis.practiceRecommendations}
              />

              {/* Analysis History */}
              {analysisHistory.length > 1 && (
                <div>
                  <h2 className="mb-4 font-headline text-2xl font-bold uppercase">
                    Your Progress Over Time
                  </h2>
                  <AnalysisTimeline analyses={analysisHistory} />
                </div>
              )}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
    </>
  );
}

function EmptyState() {
  return (
    <div className="border-4 border-black bg-white p-12 text-center shadow-hard">
      <Icon name="psychology" className="mx-auto text-8xl text-gray-300" />
      <h2 className="mt-6 font-headline text-2xl font-bold uppercase">
        No Insights Yet
      </h2>
      <p className="mx-auto mt-3 max-w-md text-gray-600">
        Complete a mock test and request AI analysis to get personalized study
        recommendations and performance insights.
      </p>
      <Link
        href="/mock"
        className="mt-6 inline-flex items-center gap-2 border-2 border-black bg-brand px-6 py-3 font-bold uppercase shadow-hard transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      >
        <Icon name="play_arrow" />
        <span>Take a Mock Test</span>
      </Link>
    </div>
  );
}
