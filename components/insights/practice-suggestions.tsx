import Link from "next/link";
import { Icon } from "@/components/dashboard/icon";
import type { AIAnalysis } from "@/lib/queries/insights";

interface PracticeSuggestionsProps {
  suggestions: AIAnalysis['practiceRecommendations'];
}

export function PracticeSuggestions({ suggestions }: PracticeSuggestionsProps) {
  if (suggestions.length === 0) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-400 border-green-600';
      case 'medium': return 'bg-yellow-400 border-yellow-600';
      case 'hard': return 'bg-red-400 border-red-600';
      default: return 'bg-gray-400 border-gray-600';
    }
  };

  return (
    <div className="border-4 border-black bg-blue-50 p-6 shadow-hard">
      <div className="mb-4 flex items-center gap-2">
        <Icon name="quiz" className="text-3xl text-blue-600" />
        <h3 className="font-headline text-xl font-bold uppercase">Practice Recommendations</h3>
      </div>

      <p className="mb-6 text-sm text-gray-600">
        Strengthen your weak areas with targeted practice
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h4 className="font-bold">{suggestion.topic}</h4>
                <p className="text-xs text-gray-600">{suggestion.subject}</p>
              </div>
              <span className={`border-2 ${getDifficultyColor(suggestion.difficulty)} px-2 py-1 text-xs font-bold uppercase`}>
                {suggestion.difficulty}
              </span>
            </div>

            <div className="mb-3 flex items-center gap-2 text-sm">
              <Icon name="assignment" className="text-gray-600" />
              <span className="font-bold">{suggestion.question_count} questions</span>
            </div>

            {suggestion.focus_areas.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 text-xs font-bold uppercase text-gray-600">Focus Areas:</p>
                <div className="flex flex-wrap gap-1">
                  {suggestion.focus_areas.map((area, i) => (
                    <span key={i} className="border border-black bg-gray-100 px-2 py-0.5 text-xs">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Link
              href="/subjects"
              className="mt-3 flex items-center justify-center gap-2 border-2 border-black bg-brand px-4 py-2 font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <Icon name="play_arrow" />
              <span>Start Practice</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
