import { Icon } from "@/components/dashboard/icon";
import { PriorityBadge } from "./priority-badge";
import type { AIAnalysis } from "@/lib/queries/insights";

interface RecommendationsListProps {
  recommendations: AIAnalysis['studyRecommendations'];
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  if (recommendations.length === 0) return null;

  // Sort by priority: high > medium > low
  const sortedRecs = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="border-4 border-black bg-purple-50 p-6 shadow-hard">
      <div className="mb-4 flex items-center gap-2">
        <Icon name="lightbulb" className="text-3xl text-purple-600" />
        <h3 className="font-headline text-xl font-bold uppercase">Personalized Study Plan</h3>
      </div>

      <p className="mb-6 text-sm text-gray-600">
        Follow these recommendations in order to maximize your improvement
      </p>

      <div className="space-y-4">
        {sortedRecs.map((rec, index) => (
          <div key={index} className="border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border-2 border-black bg-brand font-headline text-lg font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-bold">
                    {rec.topic || rec.subject}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {rec.type === 'topic' ? 'Topic Review' : 
                     rec.type === 'subject' ? 'Subject Focus' : 
                     'Difficulty Training'}
                  </p>
                </div>
              </div>
              <PriorityBadge priority={rec.priority} />
            </div>

            <p className="mb-3 text-sm leading-relaxed text-gray-700">
              {rec.reason}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Icon name="schedule" className="text-sm" />
                <span>~{rec.estimated_time_hours}h</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon name="category" className="text-sm" />
                <span>{rec.subject}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
