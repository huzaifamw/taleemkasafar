"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/dashboard/icon";
import { triggerAIAnalysis } from "@/app/(dashboard)/insights/actions";
import { AIThinkingLoader } from "./ai-thinking-loader";
import { AIErrorState } from "./ai-error-state";
import { getAnalysisEligibility } from "@/lib/ai/analysis-eligibility";

interface AIAnalysisTriggerProps {
  attemptId: string;
  hasExistingAnalysis?: boolean;
  attemptedCount: number;
  totalQuestions: number;
}

export function AIAnalysisTrigger({
  attemptId,
  hasExistingAnalysis,
  attemptedCount,
  totalQuestions,
}: AIAnalysisTriggerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextAvailable, setNextAvailable] = useState<string | null>(null);
  const eligibility = getAnalysisEligibility(attemptedCount, totalQuestions);
  const belowHalf = totalQuestions > 0 && attemptedCount / totalQuestions < 0.5;

  const handleTrigger = async () => {
    if (!eligibility.eligible) return;
    setLoading(true);
    setError(null);
    
    const result = await triggerAIAnalysis(attemptId);
    
    if (result.success) {
      // Navigate to insights page
      router.push('/insights');
    } else {
      setError(result.error || 'Failed to generate analysis');
      setNextAvailable(result.nextAvailableAt || null);
      setLoading(false);
    }
  };

  if (loading) {
    return <AIThinkingLoader />;
  }

  if (error) {
    return (
      <AIErrorState
        title="Unable to Generate Analysis"
        message={error}
        nextAvailableAt={nextAvailable || undefined}
        onRetry={() => setError(null)}
      />
    );
  }

  if (hasExistingAnalysis) {
    return (
      <div className="border-4 border-black bg-purple-50 p-6 shadow-hard">
        <div className="flex items-start gap-4">
          <Icon name="psychology" className="flex-shrink-0 text-4xl text-purple-600" />
          <div className="flex-1">
            <h3 className="font-headline text-xl font-bold uppercase">
              AI Analysis Available
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Your personalized performance insights are ready to view.
            </p>
            {belowHalf && <LimitedDataWarning />}
            <button
              onClick={() => router.push('/insights')}
              className="mt-4 flex items-center gap-2 border-2 border-black bg-brand px-6 py-2 font-bold uppercase shadow-hard transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <Icon name="visibility" />
              <span>View Insights</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-4 border-black bg-gradient-to-br from-purple-100 to-blue-100 p-6 shadow-hard">
      <div className="flex items-start gap-4">
        <Icon name="psychology" className="flex-shrink-0 text-4xl text-brand" />
        <div className="flex-1">
          <h3 className="font-headline text-xl font-bold uppercase">
            Get AI Performance Insights
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Let our AI analyze your performance and provide personalized study recommendations based on your strengths and weaknesses.
          </p>

          <div className="mt-4 border-2 border-black bg-white p-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase">
              <span>Answered questions</span>
              <span>{eligibility.attemptedCount}/{eligibility.totalQuestions} · {eligibility.completionPercentage}%</span>
            </div>
            <div className="mt-2 h-2 border border-black bg-gray-100">
              <div
                className="h-full bg-brand transition-[width]"
                style={{ width: `${eligibility.completionPercentage}%` }}
              />
            </div>
          </div>

          {belowHalf && <LimitedDataWarning />}

          {!eligibility.eligible && (
            <p className="mt-3 border-2 border-black bg-red-50 p-3 text-sm font-semibold text-red-800">
              AI analysis requires at least {eligibility.requiredAnswers} answered questions.
              This attempt has {eligibility.attemptedCount}; complete more questions on a future attempt to unlock it.
            </p>
          )}
          
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Icon name="check_circle" className="text-sm text-green-600" />
              <span>Identify weak topics</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="check_circle" className="text-sm text-green-600" />
              <span>Personalized recommendations</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="check_circle" className="text-sm text-green-600" />
              <span>Study time estimates</span>
            </div>
          </div>

          <button
            onClick={handleTrigger}
            disabled={!eligibility.eligible}
            className="mt-4 flex items-center gap-2 border-2 border-black bg-brand px-6 py-2 font-bold uppercase shadow-hard transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 disabled:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          >
            <Icon name="auto_awesome" />
            <span>Generate AI Insights</span>
          </button>

          <p className="mt-2 text-xs text-gray-500">
            Free • Takes 3-5 seconds • Limited to 3 per day
          </p>
        </div>
      </div>
    </div>
  );
}

function LimitedDataWarning() {
  return (
    <div className="mt-4 flex items-start gap-2 border-2 border-black bg-yellow-100 p-3 text-sm font-semibold">
      <Icon name="warning" className="mt-0.5 text-lg text-yellow-700" />
      <span>This analysis is based on limited test data.</span>
    </div>
  );
}
