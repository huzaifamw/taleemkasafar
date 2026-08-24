import { getGeminiModel } from "./gemini-client";
import { buildAnalysisPrompt, type PerformanceData } from "./analysis-prompt";
import { createClient } from "@/lib/supabase/server";

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
  
  let analysis;
  try {
    analysis = JSON.parse(cleanedResponse);
  } catch (parseError) {
    console.error('Failed to parse AI response:', cleanedResponse.slice(0, 500));
    throw new Error('AI returned invalid JSON format');
  }

  // Validate required fields
  if (!analysis.performance_tier || !analysis.strengths || !analysis.weaknesses) {
    console.error('Missing required fields in AI response:', analysis);
    throw new Error('AI response missing required fields');
  }

  // 5. Save to database
  const { data, error } = await supabase
    .from('ai_performance_analysis')
    .insert({
      attempt_id: attemptId,
      user_id: userId,
      overall_score: performanceData.overallScore,
      performance_tier: analysis.performance_tier,
      weak_subjects: analysis.weak_subjects,
      weak_topics: analysis.weak_topics,
      weak_difficulty_levels: {
        easy: performanceData.difficultyBreakdown.easy.percentage,
        medium: performanceData.difficultyBreakdown.medium.percentage,
        hard: performanceData.difficultyBreakdown.hard.percentage
      },
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      study_recommendations: analysis.study_recommendations,
      practice_recommendations: analysis.practice_recommendations,
      motivational_message: analysis.motivational_message,
      ai_model_used: 'gemini-3.6-flash',
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
      *,
      attempts!inner(
        id,
        entry_test_id,
        submitted_at,
        entry_tests(name)
      )
    `)
    .eq('attempt_id', attemptId)
    .single();

  if (mockError || !mockResult) {
    console.error('Mock result fetch error:', mockError);
    throw new Error('Mock result not found');
  }

  console.log('Mock result per_subject structure:', JSON.stringify(mockResult.per_subject).slice(0, 200));

  // Subject breakdown from mock_results.per_subject
  // Handle both array format and object format
  let subjectData: any[] = [];
  if (Array.isArray(mockResult.per_subject)) {
    subjectData = mockResult.per_subject;
  } else if (mockResult.per_subject && typeof mockResult.per_subject === 'object') {
    // If it's an object, convert to array
    subjectData = Object.values(mockResult.per_subject);
  }

  const subjectBreakdown = subjectData.map((s: any) => ({
    subject: s.subject_name || s.name || 'Unknown',
    score: s.correct_count || s.correct || 0,
    total: s.total_questions || s.total || 1,
    percentage: Math.round(((s.correct_count || s.correct || 0) / (s.total_questions || s.total || 1)) * 100)
  }));

  // Fetch all answers for this attempt with question details
  const { data: answers, error: answersError } = await supabase
    .from('attempt_answers')
    .select(`
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

  // Group by topics to get topic breakdown
  const topicMap = new Map<string, {
    topic: string;
    subject: string;
    correct: number;
    total: number;
  }>();

  answers?.forEach((answer: any) => {
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

  answers?.forEach((answer: any) => {
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
  const { data: previousAttempts } = await supabase
    .from('mock_results')
    .select(`
      score_percent,
      attempts!inner(submitted_at)
    `)
    .eq('attempts.user_id', userId)
    .neq('attempt_id', attemptId)
    .not('attempts.submitted_at', 'is', null)
    .order('attempts.submitted_at', { ascending: false })
    .limit(5);

  return {
    overallScore: mockResult.score_percent,
    timeTaken: mockResult.total_time_ms || 0,
    testName: (mockResult.attempts as any)?.entry_tests?.name || 'Mock Test',
    subjectBreakdown,
    topicBreakdown,
    difficultyBreakdown,
    previousAttempts: previousAttempts?.map(a => ({
      date: new Date((a.attempts as any).submitted_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      score: a.score_percent
    })) || []
  };
}
