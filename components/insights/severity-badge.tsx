const SEVERITY_CONFIG = {
  critical: {
    bg: 'bg-red-600',
    text: 'text-white',
    label: 'Critical'
  },
  high: {
    bg: 'bg-orange-500',
    text: 'text-white',
    label: 'High'
  },
  medium: {
    bg: 'bg-yellow-500',
    text: 'text-black',
    label: 'Medium'
  },
  low: {
    bg: 'bg-blue-500',
    text: 'text-white',
    label: 'Low'
  },
} as const;

interface SeverityBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium;

  return (
    <span className={`${config.bg} ${config.text} border border-black px-2 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
      {config.label}
    </span>
  );
}
