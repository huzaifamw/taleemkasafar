import Link from "next/link";
import { Icon } from "@/components/dashboard/icon";
import { PerformanceBadge } from "./performance-badge";
import type { AIAnalysis } from "@/lib/queries/insights";

interface AnalysisTimelineProps {
  analyses: AIAnalysis[];
}

export function AnalysisTimeline({ analyses }: AnalysisTimelineProps) {
  if (analyses.length === 0) {
    return (
      <div className="border-4 border-black bg-gray-50 p-12 text-center shadow-hard">
        <Icon name="history" className="mx-auto text-6xl text-gray-400" />
        <h3 className="mt-4 font-headline text-xl font-bold uppercase text-gray-600">
          No Analysis History Yet
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Complete a mock test and request AI analysis to see your progress
        </p>
      </div>
    );
  }

  return (
    <div className="border-4 border-black bg-white p-6 shadow-hard">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="timeline" className="text-3xl text-brand" />
          <h3 className="font-headline text-xl font-bold uppercase">Analysis History</h3>
        </div>
        <span className="text-sm text-gray-600">{analyses.length} total</span>
      </div>

      <div className="space-y-4">
        {analyses.map((analysis, index) => {
          const date = new Date(analysis.createdAt);
          const isFirst = index === 0;

          return (
            <div key={analysis.id} className={`relative border-2 border-black bg-gray-50 p-4 ${isFirst ? 'shadow-hard' : 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}>
              {/* Timeline dot */}
              {index < analyses.length - 1 && (
                <div className="absolute -bottom-4 left-6 h-4 w-0.5 bg-gray-300" />
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-black ${isFirst ? 'bg-brand' : 'bg-white'}`}>
                    <Icon name={isFirst ? 'star' : 'check_circle'} className={isFirst ? 'text-white' : 'text-gray-600'} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">
                      {date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="mt-1 font-bold">Score: {analysis.overallScore}%</p>
                    <p className="mt-1 text-xs text-gray-600">
                      {analysis.strengths.length} strengths • {analysis.weaknesses.length} improvements • {analysis.studyRecommendations.length} recommendations
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <PerformanceBadge tier={analysis.performanceTier} />
                  {isFirst && (
                    <span className="border border-brand bg-brand/10 px-2 py-0.5 text-xs font-bold uppercase text-brand">
                      Latest
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {analyses.length >= 2 && (
        <div className="mt-6 border-t-2 border-black pt-6">
          <div className="flex items-center justify-between rounded bg-gray-100 p-4">
            <div>
              <p className="text-sm font-bold uppercase text-gray-600">Progress Trend</p>
              <p className="mt-1 text-xs text-gray-600">
                From {analyses[analyses.length - 1].overallScore}% to {analyses[0].overallScore}%
              </p>
            </div>
            <div className="flex items-center gap-2">
              {analyses[0].overallScore > analyses[analyses.length - 1].overallScore ? (
                <>
                  <Icon name="trending_up" className="text-3xl text-green-600" />
                  <span className="font-headline text-2xl font-bold text-green-600">
                    +{(analyses[0].overallScore - analyses[analyses.length - 1].overallScore).toFixed(1)}%
                  </span>
                </>
              ) : analyses[0].overallScore < analyses[analyses.length - 1].overallScore ? (
                <>
                  <Icon name="trending_down" className="text-3xl text-red-600" />
                  <span className="font-headline text-2xl font-bold text-red-600">
                    {(analyses[0].overallScore - analyses[analyses.length - 1].overallScore).toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <Icon name="trending_flat" className="text-3xl text-gray-600" />
                  <span className="font-headline text-2xl font-bold text-gray-600">
                    No Change
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
