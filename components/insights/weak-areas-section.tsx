import { Icon } from "@/components/dashboard/icon";
import { SeverityBadge } from "./severity-badge";
import type { AIAnalysis } from "@/lib/queries/insights";

interface WeakAreasSectionProps {
  weaknesses: string[];
  weakSubjects: AIAnalysis['weakSubjects'];
  weakTopics: AIAnalysis['weakTopics'];
}

export function WeakAreasSection({ weaknesses, weakSubjects, weakTopics }: WeakAreasSectionProps) {
  if (weaknesses.length === 0 && weakSubjects.length === 0 && weakTopics.length === 0) {
    return null;
  }

  return (
    <div className="border-4 border-black bg-orange-50 p-6 shadow-hard">
      <div className="mb-4 flex items-center gap-2">
        <Icon name="warning" className="text-3xl text-orange-600" />
        <h3 className="font-headline text-xl font-bold uppercase">Areas to Improve</h3>
      </div>

      {/* General Weaknesses */}
      {weaknesses.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-bold uppercase text-gray-600">Key Observations</h4>
          <ul className="space-y-3">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start gap-3 border-l-4 border-orange-600 bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Icon name="priority_high" className="mt-0.5 flex-shrink-0 text-xl text-orange-600" />
                <span className="text-sm leading-relaxed">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weak Subjects */}
      {weakSubjects.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-bold uppercase text-gray-600">Weak Subjects</h4>
          <div className="space-y-2">
            {weakSubjects.map((subject, index) => (
              <div key={index} className="flex items-center justify-between border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3">
                  <Icon name="subject" className="text-2xl text-gray-600" />
                  <div>
                    <p className="font-bold">{subject.subject}</p>
                    <p className="text-xs text-gray-600">{subject.score}% correct</p>
                  </div>
                </div>
                <SeverityBadge severity={subject.severity} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak Topics */}
      {weakTopics.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase text-gray-600">Topics Needing Focus</h4>
          <div className="space-y-2">
            {weakTopics.slice(0, 5).map((topic, index) => (
              <div key={index} className="flex items-center justify-between border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3">
                  <Icon name="menu_book" className="text-2xl text-gray-600" />
                  <div>
                    <p className="font-bold">{topic.topic}</p>
                    <p className="text-xs text-gray-600">{topic.subject} • {topic.score}% correct</p>
                  </div>
                </div>
                <SeverityBadge severity={topic.severity} />
              </div>
            ))}
          </div>
          {weakTopics.length > 5 && (
            <p className="mt-3 text-center text-xs text-gray-600">
              + {weakTopics.length - 5} more topics
            </p>
          )}
        </div>
      )}
    </div>
  );
}
