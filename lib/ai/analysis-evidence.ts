import {
  hasEnoughTopicEvidence,
  STRONG_ACCURACY_PERCENT,
  WEAK_ACCURACY_PERCENT,
  type PerformanceData,
} from "./analysis-prompt";

function severityForAccuracy(percentage: number): "critical" | "high" {
  return percentage < 30 ? "critical" : "high";
}

/** Build variable-length findings directly from measured, answered-question data. */
export function buildEvidenceSummary(performanceData: PerformanceData) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  for (const subject of performanceData.subjectBreakdown) {
    const evidence = `${subject.score}/${subject.total} answered correctly (${subject.percentage}% accuracy)`;
    if (subject.percentage >= STRONG_ACCURACY_PERCENT) {
      strengths.push(`${subject.subject} is a strong subject: ${evidence}.`);
    } else if (subject.percentage < WEAK_ACCURACY_PERCENT) {
      weaknesses.push(`${subject.subject} needs improvement: ${evidence}.`);
    }
  }

  const supportedTopics = performanceData.topicBreakdown.filter(topic =>
    hasEnoughTopicEvidence(topic.total),
  );

  for (const topic of supportedTopics) {
    const evidence = `${topic.score}/${topic.total} answered correctly (${topic.percentage}% accuracy)`;
    if (topic.percentage >= STRONG_ACCURACY_PERCENT) {
      strengths.push(`${topic.topic} in ${topic.subject} is a strong topic: ${evidence}.`);
    } else if (topic.percentage < WEAK_ACCURACY_PERCENT) {
      weaknesses.push(`${topic.topic} in ${topic.subject} needs improvement: ${evidence}.`);
    }
  }

  return {
    strengths,
    weaknesses,
    weakSubjects: performanceData.subjectBreakdown
      .filter(subject => subject.percentage < WEAK_ACCURACY_PERCENT)
      .map(subject => ({
        subject: subject.subject,
        score: subject.percentage,
        severity: severityForAccuracy(subject.percentage),
      })),
    weakTopics: supportedTopics
      .filter(topic => topic.percentage < WEAK_ACCURACY_PERCENT)
      .map(topic => ({
        topic: topic.topic,
        subject: topic.subject,
        score: topic.percentage,
        severity: severityForAccuracy(topic.percentage),
      })),
  };
}
