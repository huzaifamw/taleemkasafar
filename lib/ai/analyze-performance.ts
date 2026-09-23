import { GEMINI_MODEL, getGeminiModel } from "./gemini-client";
import { buildAnalysisPrompt, type PerformanceData } from "./analysis-prompt";
import { createClient } from "@/lib/supabase/server";
import {
  getAnalysisEligibility,
  getAnsweredAccuracy,
  getRequiredSubjectAnswers,
  isAnsweredSelection,
} from "./analysis-eligibility";
import type { Json } from "@/lib/database.types";

type AnalysisItem = { [key: string]: Json | undefined };
type ParsedAIAnalysis = {
  performance_tier: string;
  strengths: string[];
  weaknesses: string[];
  weak_subjects: AnalysisItem[];
  weak_topics: AnalysisItem[];
  study_recommendations: AnalysisItem[];
  practice_recommendations: AnalysisItem[];
  motivational_message: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function analysisItems(value: unknown): AnalysisItem[] {
  return Array.isArray(value)
    ? value.filter(isRecord).map(item => item as AnalysisItem)
    : [];
}

/**
 * Main function to analyze student performance using AI
 * Fetches performance data, calls Gemini API, and saves results
 */
export async function analyzePerformance(attemptId: string, userId: string) {
  const supabase = await createClient();

  // 1. Fetch comprehensive performance data
  const performanceData = await fetchPerformanceData(attemptId, userId);

  // 2. Build AI prompt
  const prompt = buildAnalysisPrompt(performanceData);

  // 3. Call Gemini API
  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const response = result.response.text();

  console.log('Raw AI response:', response.slice(0, 200));

  // 4. Parse JSON response (remove markdown formatting if present)
  const cleanedResponse = response
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanedResponse);
  } catch {
    console.error('Failed to parse AI response:', cleanedResponse.slice(0, 500));
    throw new Error('AI returned invalid JSON format');
  }

  // Validate required fields
  if (
    !isRecord(parsed) ||
    typeof parsed.performance_tier !== "string" ||
    !Array.isArray(parsed.strengths) ||
    !Array.isArray(parsed.weaknesses)
  ) {
    console.error('Missing required fields in AI response:', parsed);
    throw new Error('AI response missing required fields');
  }

  const analysis: ParsedAIAnalysis = {
    performance_tier: parsed.performance_tier,
    strengths: parsed.strengths.filter((item): item is string => typeof item === "string"),
    weaknesses: parsed.weaknesses.filter((item): item is string => typeof item === "string"),
    weak_subjects: analysisItems(parsed.weak_subjects),
    weak_topics: analysisItems(parsed.weak_topics),
    study_recommendations: analysisItems(parsed.study_recommendations),
    practice_recommendations: analysisItems(parsed.practice_recommendations),
    motivational_message:
      typeof parsed.motivational_message === "string" ? parsed.motivational_message : "",
  };

  // Gemini is instructed to use eligible subjects only. Enforce the same rule
  // in application code before any structured recommendations are persisted.
  const safeAnalysis = restrictAnalysisToEligibleSubjects(analysis, performanceData);

  // 5. Save to database
  const { data, error } = await supabase
    .from('ai_performance_analysis')
    .insert({
      attempt_id: attemptId,
      user_id: userId,
      overall_score: performanceData.overallScore,
      performance_tier: safeAnalysis.performance_tier,
      weak_subjects: safeAnalysis.weak_subjects,
      weak_topics: safeAnalysis.weak_topics,
      weak_difficulty_levels: {
        easy: performanceData.difficultyBreakdown.easy.percentage,
        medium: performanceData.difficultyBreakdown.medium.percentage,
        hard: performanceData.difficultyBreakdown.hard.percentage
      },
      strengths: safeAnalysis.strengths,
      weaknesses: safeAnalysis.weaknesses,
      study_recommendations: safeAnalysis.study_recommendations,
      practice_recommendations: safeAnalysis.practice_recommendations,
      motivational_message: safeAnalysis.motivational_message,
      ai_model_used: GEMINI_MODEL,
      tokens_used: result.response.usageMetadata?.totalTokenCount || 0
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Fetch comprehensive performance data for AI analysis
 */
async function fetchPerformanceData(
  attemptId: string, 
  userId: string
): Promise<PerformanceData> {
  const supabase = await createClient();

  // Fetch current attempt and mock results
  const { data: mockResult, error: mockError } = await supabase
    .from('mock_results')
    .select(`
      attempted_count,
      total_questions,
      score_percent,
      total_time_ms,
      attempts!inner(
        id,
        user_id,
        entry_test_id,
        submitted_at,
        entry_tests(name)
      )
    `)
    .eq('attempt_id', attemptId)
    .eq('attempts.user_id', userId)
    .single();

  if (mockError || !mockResult) {
    console.error('Mock result fetch error:', mockError);
    throw new Error('Mock result not found');
  }

  const eligibility = getAnalysisEligibility(
    mockResult.attempted_count,
    mockResult.total_questions,
  );
  if (!eligibility.eligible) {
    throw new Error(
      `AI analysis requires at least ${eligibility.requiredAnswers} answered questions. This attempt has ${eligibility.attemptedCount}.`,
    );
  }

  // Fetch all answers for this attempt with question details
  const { data: answers, error: answersError } = await supabase
    .from('attempt_answers')
    .select(`
      selected_option_id,
      is_correct,
      questions!inner(
        id,
        subject_id,
        topic_id,
        difficulty,
        topics(id, title),
        subjects(id, name)
      )
    `)
    .eq('attempt_id', attemptId);

  if (answersError) {
    throw new Error('Failed to fetch answer details');
  }

  const allAnswers = answers ?? [];
  // Frozen mock rows include unanswered questions with a null option. Keep them
  // only for sample-size totals; never include them in accuracy calculations.
  const answered = allAnswers.filter(answer =>
    isAnsweredSelection(answer.selected_option_id),
  );

  type SubjectStats = {
    id: string;
    subject: string;
    availableTotal: number;
    answered: number;
    correct: number;
  };
  const subjectMap = new Map<string, SubjectStats>();

  for (const answer of allAnswers) {
    const question = answer.questions;
    const subjectId = question?.subject_id as string | undefined;
    if (!subjectId) continue;
    const stats = subjectMap.get(subjectId) ?? {
      id: subjectId,
      subject: question.subjects?.name || 'Unknown Subject',
      availableTotal: 0,
      answered: 0,
      correct: 0,
    };
    stats.availableTotal++;
    if (isAnsweredSelection(answer.selected_option_id)) {
      stats.answered++;
      if (answer.is_correct === true) stats.correct++;
    }
    subjectMap.set(subjectId, stats);
  }

  const eligibleSubjectIds = new Set<string>();
  const subjectBreakdown: PerformanceData["subjectBreakdown"] = [];
  const excludedSubjects: PerformanceData["excludedSubjects"] = [];

  for (const stats of subjectMap.values()) {
    const requiredAnswers = getRequiredSubjectAnswers(stats.availableTotal);
    if (stats.answered >= requiredAnswers) {
      eligibleSubjectIds.add(stats.id);
      subjectBreakdown.push({
        subject: stats.subject,
        score: stats.correct,
        total: stats.answered,
        availableTotal: stats.availableTotal,
        requiredAnswers,
        percentage: stats.answered > 0
          ? Math.round((stats.correct / stats.answered) * 100)
          : 0,
      });
    } else {
      excludedSubjects.push({
        subject: stats.subject,
        answered: stats.answered,
        availableTotal: stats.availableTotal,
        requiredAnswers,
      });
    }
  }

  const eligibleAnswers = answered.filter(answer =>
    eligibleSubjectIds.has(answer.questions?.subject_id),
  );

  // Group by topics to get topic breakdown
  const topicMap = new Map<string, {
    topic: string;
    subject: string;
    correct: number;
    total: number;
  }>();

  eligibleAnswers.forEach(answer => {
    const topicId = answer.questions.topic_id;
    if (!topicId) return;

    if (!topicMap.has(topicId)) {
      topicMap.set(topicId, {
        topic: answer.questions.topics?.title || 'Unknown Topic',
        subject: answer.questions.subjects?.name || 'Unknown Subject',
        correct: 0,
        total: 0
      });
    }

    const topic = topicMap.get(topicId)!;
    topic.total++;
    if (answer.is_correct) topic.correct++;
  });

  const topicBreakdown = Array.from(topicMap.values()).map(t => ({
    topic: t.topic,
    subject: t.subject,
    score: t.correct,
    total: t.total,
    percentage: Math.round((t.correct / t.total) * 100)
  }));

  // Calculate difficulty breakdown
  const difficultyMap: Record<string, { correct: number; total: number }> = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 }
  };

  eligibleAnswers.forEach(answer => {
    const diff = answer.questions.difficulty as 'easy' | 'medium' | 'hard';
    if (difficultyMap[diff]) {
      difficultyMap[diff].total++;
      if (answer.is_correct) difficultyMap[diff].correct++;
    }
  });

  const difficultyBreakdown = {
    easy: {
      ...difficultyMap.easy,
      percentage: difficultyMap.easy.total > 0
        ? Math.round((difficultyMap.easy.correct / difficultyMap.easy.total) * 100)
        : 0
    },
    medium: {
      ...difficultyMap.medium,
      percentage: difficultyMap.medium.total > 0
        ? Math.round((difficultyMap.medium.correct / difficultyMap.medium.total) * 100)
        : 0
    },
    hard: {
      ...difficultyMap.hard,
      percentage: difficultyMap.hard.total > 0
        ? Math.round((difficultyMap.hard.correct / difficultyMap.hard.total) * 100)
        : 0
    }
  };

  // Fetch previous 5 attempts for comparison
  const currentAttempt = mockResult.attempts;
  const { data: previousAttempts } = await supabase
    .from('mock_results')
    .select(`
      score_percent,
      attempts!inner(submitted_at)
    `)
    .eq('attempts.user_id', userId)
    .eq('attempts.entry_test_id', currentAttempt?.entry_test_id)
    .neq('attempt_id', attemptId)
    .not('attempts.submitted_at', 'is', null)
    .order('attempts.submitted_at', { ascending: false })
    .limit(5);

  return {
    overallScore: Number(mockResult.score_percent),
    answeredAccuracy: getAnsweredAccuracy(
      allAnswers.map(answer => ({
        selectedOptionId: answer.selected_option_id,
        isCorrect: answer.is_correct,
      })),
    ),
    attemptedCount: eligibility.attemptedCount,
    totalQuestions: eligibility.totalQuestions,
    completionPercentage: eligibility.completionPercentage,
    limitedData: eligibility.limitedData,
    timeTaken: mockResult.total_time_ms || 0,
    testName: currentAttempt?.entry_tests?.name || 'Mock Test',
    subjectBreakdown,
    excludedSubjects,
    topicBreakdown,
    difficultyBreakdown,
    previousAttempts: previousAttempts?.map(a => ({
      date: new Date(a.attempts.submitted_at!).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      score: a.score_percent
    })) || []
  };
}

function restrictAnalysisToEligibleSubjects(
  analysis: ParsedAIAnalysis,
  performanceData: PerformanceData,
) {
  const normalize = (value: unknown) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";
  const allowedSubjects = new Set(
    performanceData.subjectBreakdown.map(subject => normalize(subject.subject)),
  );
  const allowedTopics = new Set(
    performanceData.topicBreakdown.map(
      topic => `${normalize(topic.subject)}::${normalize(topic.topic)}`,
    ),
  );
  const excludedNames = performanceData.excludedSubjects
    .map(subject => normalize(subject.subject))
    .filter(Boolean);
  const mentionsExcludedSubject = (value: unknown) => {
    const text = normalize(value);
    return excludedNames.some(name => text.includes(name));
  };
  const allowedSubjectItem = (item: AnalysisItem) =>
    item && allowedSubjects.has(normalize(item.subject));
  const allowedTopicItem = (item: AnalysisItem) =>
    allowedSubjectItem(item) &&
    allowedTopics.has(`${normalize(item.subject)}::${normalize(item.topic)}`);

  return {
    ...analysis,
    strengths: analysis.strengths.filter(item => !mentionsExcludedSubject(item)),
    weaknesses: analysis.weaknesses.filter(item => !mentionsExcludedSubject(item)),
    weak_subjects: analysis.weak_subjects.filter(allowedSubjectItem),
    weak_topics: analysis.weak_topics.filter(allowedTopicItem),
    study_recommendations: analysis.study_recommendations.filter(allowedSubjectItem),
    practice_recommendations: analysis.practice_recommendations.filter(allowedTopicItem),
  };
}
