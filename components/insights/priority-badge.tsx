const PRIORITY_CONFIG = {
  high: {
    bg: 'bg-red-400',
    border: 'border-red-600',
    label: 'High Priority'
  },
  medium: {
    bg: 'bg-yellow-400',
    border: 'border-yellow-600',
    label: 'Medium Priority'
  },
  low: {
    bg: 'bg-green-400',
    border: 'border-green-600',
    label: 'Low Priority'
  },
} as const;

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;

  return (
    <span className={`${config.bg} ${config.border} inline-flex items-center border-2 px-2 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
      {config.label}
    </span>
  );
}
