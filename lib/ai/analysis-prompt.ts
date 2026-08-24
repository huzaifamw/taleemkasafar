export interface PerformanceData {
  overallScore: number;
  timeTaken: number;
  testName: string;
  subjectBreakdown: Array<{
    subject: string;
    score: number;
    total: number;
    percentage: number;
  }>;
  topicBreakdown: Array<{
    topic: string;
    subject: string;
    score: number;
    total: number;
    percentage: number;
  }>;
  difficultyBreakdown: {
    easy: { correct: number; total: number; percentage: number };
    medium: { correct: number; total: number; percentage: number };
    hard: { correct: number; total: number; percentage: number };
  };
  previousAttempts?: Array<{
    date: string;
    score: number;
  }>;
}

/**
 * Build comprehensive AI analysis prompt for Gemini
 */
export function buildAnalysisPrompt(data: PerformanceData): string {
  return `You are an expert educational AI tutor specializing in Pakistani university entry test preparation (NUST NET, ECAT, MDCAT, PU, GIKI). Analyze this student's mock test performance and provide personalized, actionable recommendations.

**STUDENT PERFORMANCE DATA:**

Overall Score: ${data.overallScore}% (${data.overallScore >= 75 ? 'Good' : data.overallScore >= 60 ? 'Average' : 'Needs Work'})
Time Taken: ${Math.floor(data.timeTaken / 60000)} minutes
Test: ${data.testName}

**SUBJECT-WISE PERFORMANCE:**
${data.subjectBreakdown.map(s => `- ${s.subject}: ${s.score}/${s.total} (${s.percentage}%)`).join('\n')}

**TOPIC-WISE PERFORMANCE (Top weakest topics):**
${data.topicBreakdown
  .sort((a, b) => a.percentage - b.percentage)
  .slice(0, 10)
  .map(t => `- ${t.topic} (${t.subject}): ${t.score}/${t.total} (${t.percentage}%)`)
  .join('\n')}

**DIFFICULTY-WISE PERFORMANCE:**
- Easy: ${data.difficultyBreakdown.easy.correct}/${data.difficultyBreakdown.easy.total} (${data.difficultyBreakdown.easy.percentage}%)
- Medium: ${data.difficultyBreakdown.medium.correct}/${data.difficultyBreakdown.medium.total} (${data.difficultyBreakdown.medium.percentage}%)
- Hard: ${data.difficultyBreakdown.hard.correct}/${data.difficultyBreakdown.hard.total} (${data.difficultyBreakdown.hard.percentage}%)

${data.previousAttempts && data.previousAttempts.length > 0 ? `
**PREVIOUS ATTEMPTS (Historical Context):**
${data.previousAttempts.map(a => `- ${a.date}: ${a.score}%`).join('\n')}
` : ''}

**YOUR TASK:**
Generate a comprehensive, personalized performance analysis with actionable study recommendations.

**OUTPUT FORMAT (Strict JSON):**
{
  "performance_tier": "excellent" | "good" | "average" | "needs_improvement",
  "strengths": [
    "Specific strength with numbers",
    "Another strength with evidence",
    "Third strength"
  ],
  "weaknesses": [
    "Specific weakness with numbers",
    "Another weakness with evidence",
    "Third weakness"
  ],
  "weak_subjects": [
    {
      "subject": "Subject Name",
      "score": <percentage>,
      "severity": "critical" | "high" | "medium" | "low"
    }
  ],
  "weak_topics": [
    {
      "topic": "Topic Name",
      "subject": "Subject Name",
      "score": <percentage>,
      "severity": "critical" | "high" | "medium" | "low"
    }
  ],
  "study_recommendations": [
    {
      "type": "topic" | "subject" | "difficulty",
      "subject": "Subject Name",
      "topic": "Topic Name (if applicable)",
      "priority": "high" | "medium" | "low",
      "reason": "Clear, specific explanation why this needs focus",
      "estimated_time_hours": <1-10>
    }
  ],
  "practice_recommendations": [
    {
      "subject": "Subject Name",
      "topic": "Topic Name",
      "question_count": <10-30>,
      "difficulty": "easy" | "medium" | "hard",
      "focus_areas": ["area1", "area2"]
    }
  ],
  "motivational_message": "Personalized, encouraging 2-3 sentence message that acknowledges progress and sets achievable goals"
}

**GUIDELINES:**
1. Be specific and use numbers from the data
2. Performance tier: excellent (>80%), good (60-80%), average (40-60%), needs_improvement (<40%)
3. Severity: critical (<30%), high (30-50%), medium (50-70%), low (>70%)
4. Prioritize high-impact improvements (topics that affect multiple subjects or are frequently tested)
5. Recommendations should be achievable (2-4 hours per topic max)
6. Be encouraging but honest - focus on what's fixable
7. For topics with <30% score, mark as "critical" severity
8. Limit to 5 study recommendations maximum (prioritize top weaknesses)
9. Limit to 3-5 practice recommendations
10. Motivational message should mention specific numbers and realistic goals

**RESPOND ONLY WITH VALID JSON. NO MARKDOWN, NO EXPLANATIONS, JUST JSON.**`;
}
