import { Icon } from "@/components/dashboard/icon";

type StatsCardProps = {
  title: string;
  value: number;
  subtitle?: string;
  icon?: string;
  trend?: "up" | "down" | "neutral";
};

/**
 * Stats card component for admin dashboard.
 * Soft Brutalist design matching student dashboard aesthetic.
 */
export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend = "neutral",
}: StatsCardProps) {
  const trendConfig = {
    up: { color: "text-green-600", icon: "trending_up" },
    down: { color: "text-red-600", icon: "trending_down" },
    neutral: { color: "text-on-surface-variant", icon: "" },
  };

  const currentTrend = trendConfig[trend];

  return (
    <div className="group relative border-2 border-black bg-white p-6 shadow-hard transition-all hover:-translate-y-1 hover:shadow-hard-primary">
      {/* Icon */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-brand-fixed">
          {icon && (
            <Icon
              name={icon}
              className="text-2xl text-brand"
              filled
            />
          )}
        </div>
        {trend !== "neutral" && (
          <div className={`flex items-center gap-1 ${currentTrend.color}`}>
            <Icon name={currentTrend.icon} className="text-lg" />
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
        {title}
      </h3>

      {/* Value */}
      <p className="mb-2 font-headline text-4xl font-bold tracking-tight text-black">
        {value.toLocaleString()}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-sm font-medium text-on-surface-variant">
          {subtitle}
        </p>
      )}
    </div>
  );
}
