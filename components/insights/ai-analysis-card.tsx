import { Icon } from "@/components/dashboard/icon";
import { PerformanceBadge } from "./performance-badge";
import type { AIAnalysis } from "@/lib/queries/insights";

interface AIAnalysisCardProps {
  analysis: AIAnalysis;
}

export function AIAnalysisCard({ analysis }: AIAnalysisCardProps) {
  const analysisDate = new Date(analysis.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="border-4 border-black bg-white p-6 shadow-hard">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Icon name="psychology" className="text-brand" />
            <span>AI Performance Analysis</span>
          </div>
          <h2 className="mt-2 font-headline text-2xl font-bold uppercase">
            Your Performance Report
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Generated on {analysisDate}
          </p>
        </div>
        <PerformanceBadge tier={analysis.performanceTier} score={analysis.overallScore} />
      </div>

      {/* Overall Score */}
      <div className="mb-6 border-2 border-black bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-gray-600">Overall Score</p>
            <p className="mt-1 font-headline text-4xl font-bold">{analysis.overallScore}%</p>
          </div>
          <Icon 
            name={
              analysis.overallScore >= 80 ? "sentiment_very_satisfied" :
              analysis.overallScore >= 60 ? "sentiment_satisfied" :
              analysis.overallScore >= 40 ? "sentiment_neutral" :
              "sentiment_dissatisfied"
            } 
            className="text-6xl text-gray-400" 
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border-2 border-black bg-blue-100 p-3 text-center">
          <Icon name="trending_up" className="mx-auto text-2xl text-blue-600" />
          <p className="mt-1 text-xs font-bold uppercase">Strengths</p>
          <p className="font-headline text-xl font-bold">{analysis.strengths.length}</p>
        </div>
        <div className="border-2 border-black bg-orange-100 p-3 text-center">
          <Icon name="flag" className="mx-auto text-2xl text-orange-600" />
          <p className="mt-1 text-xs font-bold uppercase">Areas to Improve</p>
          <p className="font-headline text-xl font-bold">{analysis.weaknesses.length}</p>
        </div>
        <div className="border-2 border-black bg-purple-100 p-3 text-center">
          <Icon name="lightbulb" className="mx-auto text-2xl text-purple-600" />
          <p className="mt-1 text-xs font-bold uppercase">Recommendations</p>
          <p className="font-headline text-xl font-bold">{analysis.studyRecommendations.length}</p>
        </div>
      </div>
    </div>
  );
}
