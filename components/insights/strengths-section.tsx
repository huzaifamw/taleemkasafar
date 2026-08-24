import { Icon } from "@/components/dashboard/icon";

interface StrengthsSectionProps {
  strengths: string[];
}

export function StrengthsSection({ strengths }: StrengthsSectionProps) {
  if (strengths.length === 0) return null;

  return (
    <div className="border-4 border-black bg-green-50 p-6 shadow-hard">
      <div className="mb-4 flex items-center gap-2">
        <Icon name="star" className="text-3xl text-green-600" />
        <h3 className="font-headline text-xl font-bold uppercase">Your Strengths</h3>
      </div>

      <ul className="space-y-3">
        {strengths.map((strength, index) => (
          <li key={index} className="flex items-start gap-3 border-l-4 border-green-600 bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Icon name="check_circle" className="mt-0.5 flex-shrink-0 text-xl text-green-600" />
            <span className="text-sm leading-relaxed">{strength}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
