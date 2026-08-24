import { Icon } from "@/components/dashboard/icon";

const TIER_CONFIG = {
  excellent: {
    bg: 'bg-green-400',
    icon: 'emoji_events',
    label: 'Excellent',
    border: 'border-green-600'
  },
  good: {
    bg: 'bg-blue-400',
    icon: 'thumb_up',
    label: 'Good',
    border: 'border-blue-600'
  },
  average: {
    bg: 'bg-yellow-400',
    icon: 'trending_up',
    label: 'Average',
    border: 'border-yellow-600'
  },
  needs_improvement: {
    bg: 'bg-orange-400',
    icon: 'priority_high',
    label: 'Needs Work',
    border: 'border-orange-600'
  },
} as const;

interface PerformanceBadgeProps {
  tier: 'excellent' | 'good' | 'average' | 'needs_improvement';
  score?: number;
}

export function PerformanceBadge({ tier, score }: PerformanceBadgeProps) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.average;

  return (
    <div className={`inline-flex items-center gap-2 border-2 ${config.border} ${config.bg} px-4 py-2 shadow-hard`}>
      <Icon name={config.icon} />
      <span className="font-headline text-lg font-bold uppercase">{config.label}</span>
      {score !== undefined && (
        <span className="ml-2 text-sm font-bold">({score}%)</span>
      )}
    </div>
  );
}
