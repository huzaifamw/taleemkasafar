import { Icon } from "@/components/dashboard/icon";

interface MotivationalMessageProps {
  message: string;
  performanceTier: 'excellent' | 'good' | 'average' | 'needs_improvement';
}

export function MotivationalMessage({ message, performanceTier }: MotivationalMessageProps) {
  const getIcon = () => {
    switch (performanceTier) {
      case 'excellent': return 'emoji_events';
      case 'good': return 'thumb_up';
      case 'average': return 'trending_up';
      case 'needs_improvement': return 'fitness_center';
      default: return 'psychology';
    }
  };

  const getGradient = () => {
    switch (performanceTier) {
      case 'excellent': return 'from-green-100 to-emerald-100';
      case 'good': return 'from-blue-100 to-cyan-100';
      case 'average': return 'from-yellow-100 to-amber-100';
      case 'needs_improvement': return 'from-orange-100 to-red-100';
      default: return 'from-purple-100 to-pink-100';
    }
  };

  return (
    <div className={`border-4 border-black bg-gradient-to-br ${getGradient()} p-6 shadow-hard`}>
      <div className="flex items-start gap-4">
        <Icon name={getIcon()} className="flex-shrink-0 text-5xl" />
        <div>
          <h3 className="mb-2 font-headline text-lg font-bold uppercase">Your AI Coach Says:</h3>
          <p className="leading-relaxed text-gray-800">{message}</p>
        </div>
      </div>
    </div>
  );
}
