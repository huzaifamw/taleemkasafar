import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";
import { getViewerContext } from "./profile";

export type AIAnalysis = {
  id: string;
  attemptId: string;
  overallScore: number;
  performanceTier: 'excellent' | 'good' | 'average' | 'needs_improvement';
  weakSubjects: Array<{
    subject: string;
    score: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }>;
  weakTopics: Array<{
    topic: string;
    subject: string;
    score: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }>;
  strengths: string[];
  weaknesses: string[];
  studyRecommendations: Array<{
    type: 'topic' | 'subject' | 'difficulty';
    subject: string;
    topic?: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
    estimated_time_hours: number;
  }>;
  practiceRecommendations: Array<{
    subject: string;
    topic: string;
    question_count: number;
    difficulty: 'easy' | 'medium' | 'hard';
    focus_areas: string[];
  }>;
  motivationalMessage: string;
  createdAt: string;
  tokensUsed: number;
};

/**
 * Get the most recent AI analysis for current user
 */
export const getLatestAIAnalysis = cache(async (): Promise<AIAnalysis | null> => {
  const history = await getAIAnalysisHistory();
  return history[0] ?? null;
});

/**
 * Get AI analysis for a specific attempt
 */
export const getAIAnalysisByAttempt = cache(async (attemptId: string): Promise<AIAnalysis | null> => {
  const viewer = await getViewerContext();
  if (!viewer) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ai_performance_analysis')
    .select('*')
    .eq('attempt_id', attemptId)
    .eq('user_id', viewer.id)
    .maybeSingle();

  if (error || !data) return null;

  return mapAnalysisData(data);
});

/**
 * Get analysis history (last 10 analyses)
 */
export const getAIAnalysisHistory = cache(async (): Promise<AIAnalysis[]> => {
  const viewer = await getViewerContext();
  if (!viewer) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ai_performance_analysis')
    .select('*')
    .eq('user_id', viewer.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !data) return [];

  return data.map(mapAnalysisData);
});

/**
 * Get study progress for a specific analysis
 */
export const getStudyProgress = cache(async (analysisId: string) => {
  const viewer = await getViewerContext();
  if (!viewer) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('study_progress')
    .select('*')
    .eq('analysis_id', analysisId)
    .eq('user_id', viewer.id)
    .order('created_at', { ascending: true });

  if (error) return [];

  return data || [];
});

/**
 * Get user's analysis stats (total analyses, avg score improvement)
 */
export const getAnalysisStats = cache(async () => {
  const viewer = await getViewerContext();
  if (!viewer) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ai_performance_analysis')
    .select('overall_score, performance_tier, created_at')
    .eq('user_id', viewer.id)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) return null;

  const totalAnalyses = data.length;
  const firstScore = data[0].overall_score;
  const latestScore = data[data.length - 1].overall_score;
  const improvement = latestScore - firstScore;

  const tierCounts = data.reduce((acc, item) => {
    acc[item.performance_tier] = (acc[item.performance_tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalAnalyses,
    firstScore,
    latestScore,
    improvement,
    tierCounts,
    firstDate: data[0].created_at,
    latestDate: data[data.length - 1].created_at
  };
});

/**
 * Helper to map database record to AIAnalysis type
 */
type AnalysisRow =
  Database["public"]["Tables"]["ai_performance_analysis"]["Row"];

function mapAnalysisData(data: AnalysisRow): AIAnalysis {
  return {
    id: data.id,
    attemptId: data.attempt_id,
    overallScore: data.overall_score,
    performanceTier: data.performance_tier as AIAnalysis["performanceTier"],
    weakSubjects: (data.weak_subjects ?? []) as AIAnalysis["weakSubjects"],
    weakTopics: (data.weak_topics ?? []) as AIAnalysis["weakTopics"],
    strengths: data.strengths || [],
    weaknesses: data.weaknesses || [],
    studyRecommendations: (data.study_recommendations ?? []) as AIAnalysis["studyRecommendations"],
    practiceRecommendations: (data.practice_recommendations ?? []) as AIAnalysis["practiceRecommendations"],
    motivationalMessage: data.motivational_message || '',
    createdAt: data.created_at,
    tokensUsed: data.tokens_used || 0
  };
}
