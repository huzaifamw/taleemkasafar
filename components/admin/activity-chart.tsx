"use client";

import { useMemo, useState } from "react";
import type { UserActivityStat } from "@/lib/queries/admin";

type ActivityChartProps = {
  data: UserActivityStat[];
};

type MetricKey = "total_attempts" | "active_users" | "new_signups";

const METRICS: Record<
  MetricKey,
  { label: string; shortLabel: string; color: string; fill: string }
> = {
  total_attempts: {
    label: "Test attempts",
    shortLabel: "Attempts",
    color: "#0058be",
    fill: "#d8e2ff",
  },
  active_users: {
    label: "Active users",
    shortLabel: "Active",
    color: "#087f5b",
    fill: "#d3f9d8",
  },
  new_signups: {
    label: "New signups",
    shortLabel: "Signups",
    color: "#9a6700",
    fill: "#fff3bf",
  },
};

const CHART = {
  width: 820,
  height: 280,
  left: 48,
  right: 16,
  top: 18,
  bottom: 48,
};

const ACTIVITY_GRADIENT_ID = "admin-activity-chart-gradient";

function formatDate(value: string, compact = false) {
  return new Intl.DateTimeFormat("en", {
    month: compact ? "short" : "long",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function niceMaximum(value: number) {
  if (value <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const rounded = normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return rounded * magnitude;
}

export function ActivityChart({ data }: ActivityChartProps) {
  const [metric, setMetric] = useState<MetricKey>("total_attempts");
  const orderedData = useMemo(
    () => [...data].sort((a, b) => a.date.localeCompare(b.date)),
    [data],
  );
  const [selectedIndex, setSelectedIndex] = useState(() =>
    Math.max(orderedData.length - 1, 0),
  );

  const totals = useMemo(
    () => ({
      signups: orderedData.reduce((sum, item) => sum + item.new_signups, 0),
      activeAverage: orderedData.length
        ? Math.round(
            orderedData.reduce((sum, item) => sum + item.active_users, 0) /
              orderedData.length,
          )
        : 0,
      attempts: orderedData.reduce(
        (sum, item) => sum + item.total_attempts,
        0,
      ),
    }),
    [orderedData],
  );

  if (orderedData.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center border-2 border-dashed border-outline-variant bg-surface-low px-6 text-center">
        <span className="material-symbols-outlined text-4xl text-outline">
          monitoring
        </span>
        <p className="mt-3 font-headline font-bold text-black">
          No activity recorded yet
        </p>
        <p className="mt-1 max-w-sm text-sm text-on-surface-variant">
          Activity trends will appear when students sign up and attempt tests.
        </p>
      </div>
    );
  }

  const metricDetails = METRICS[metric];
  const values = orderedData.map((item) => item[metric]);
  const yMaximum = niceMaximum(Math.max(...values, 1));
  const plotWidth = CHART.width - CHART.left - CHART.right;
  const plotHeight = CHART.height - CHART.top - CHART.bottom;
  const pointFor = (value: number, index: number) => ({
    x:
      CHART.left +
      (orderedData.length === 1
        ? plotWidth / 2
        : (index / (orderedData.length - 1)) * plotWidth),
    y: CHART.top + plotHeight - (value / yMaximum) * plotHeight,
  });
  const points = values.map(pointFor);
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L${points.at(-1)?.x},${CHART.top + plotHeight} L${points[0].x},${CHART.top + plotHeight} Z`;
  const selected = orderedData[Math.min(selectedIndex, orderedData.length - 1)];
  const selectedPoint = points[Math.min(selectedIndex, points.length - 1)];
  const xLabelIndexes = Array.from(
    new Set([0, Math.round((orderedData.length - 1) / 2), orderedData.length - 1]),
  );
  const gridValues = [0, 0.25, 0.5, 0.75, 1];

  const selectNearestPoint = (clientX: number, target: SVGSVGElement) => {
    const bounds = target.getBoundingClientRect();
    const svgX = ((clientX - bounds.left) / bounds.width) * CHART.width;
    const relative = Math.max(0, Math.min(plotWidth, svgX - CHART.left));
    const index = Math.round(
      (relative / plotWidth) * Math.max(orderedData.length - 1, 0),
    );
    setSelectedIndex(index);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">
            Daily trend
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="font-headline text-3xl font-bold text-black">
              {selected[metric].toLocaleString("en-US")}
            </p>
            <p className="text-sm font-semibold text-on-surface-variant">
              {metricDetails.label.toLowerCase()} · {formatDate(selected.date)}
            </p>
          </div>
        </div>

        <div
          className="grid grid-cols-3 border-2 border-black bg-surface-low p-1"
          aria-label="Activity metric"
        >
          {(Object.keys(METRICS) as MetricKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setMetric(key)}
              aria-pressed={metric === key}
              className={`min-h-10 px-2 text-xs font-bold transition-colors sm:px-4 ${
                metric === key
                  ? "bg-black text-white"
                  : "bg-transparent text-on-surface-variant hover:bg-white hover:text-black"
              }`}
            >
              {METRICS[key].shortLabel}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-sm border border-outline-variant bg-surface-lowest p-2 sm:p-4">
        <svg
          viewBox={`0 0 ${CHART.width} ${CHART.height}`}
          role="img"
          aria-label={`${metricDetails.label} during the last ${orderedData.length} days`}
          className="h-60 w-full touch-pan-y sm:h-72"
          onPointerMove={(event) => selectNearestPoint(event.clientX, event.currentTarget)}
          onPointerDown={(event) => selectNearestPoint(event.clientX, event.currentTarget)}
        >
          <defs>
            <linearGradient
              id={ACTIVITY_GRADIENT_ID}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop offset="0%" stopColor={metricDetails.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={metricDetails.color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {gridValues.map((fraction) => {
            const y = CHART.top + plotHeight - fraction * plotHeight;
            return (
              <g key={fraction}>
                <line
                  x1={CHART.left}
                  x2={CHART.width - CHART.right}
                  y1={y}
                  y2={y}
                  stroke="#d7d9df"
                  strokeDasharray={fraction === 0 ? undefined : "4 6"}
                />
                <text
                  x={CHART.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-on-surface-variant text-[11px]"
                >
                  {Math.round(yMaximum * fraction)}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill={`url(#${ACTIVITY_GRADIENT_ID})`} />
          <path
            d={linePath}
            fill="none"
            stroke={metricDetails.color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <line
            x1={selectedPoint.x}
            x2={selectedPoint.x}
            y1={CHART.top}
            y2={CHART.top + plotHeight}
            stroke="#000"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.45"
          />
          <circle
            cx={selectedPoint.x}
            cy={selectedPoint.y}
            r="7"
            fill="white"
            stroke={metricDetails.color}
            strokeWidth="4"
          />

          {xLabelIndexes.map((index) => {
            const point = points[index];
            return (
              <text
                key={index}
                x={point.x}
                y={CHART.height - 15}
                textAnchor={
                  index === 0
                    ? "start"
                    : index === orderedData.length - 1
                      ? "end"
                      : "middle"
                }
                className="fill-on-surface-variant text-[11px] font-semibold"
              >
                {formatDate(orderedData[index].date, true)}
              </text>
            );
          })}

          <rect
            x={CHART.left}
            y={CHART.top}
            width={plotWidth}
            height={plotHeight}
            fill="transparent"
          />
        </svg>
        <p className="mt-1 text-center text-xs text-on-surface-variant sm:hidden">
          Touch or drag across the chart to inspect each day.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="New signups"
          value={totals.signups}
          detail={`${orderedData.length}-day total`}
          color={METRICS.new_signups.color}
          fill={METRICS.new_signups.fill}
        />
        <SummaryCard
          label="Active users"
          value={totals.activeAverage}
          detail="Daily average"
          color={METRICS.active_users.color}
          fill={METRICS.active_users.fill}
        />
        <SummaryCard
          label="Test attempts"
          value={totals.attempts}
          detail={`${orderedData.length}-day total`}
          color={METRICS.total_attempts.color}
          fill={METRICS.total_attempts.fill}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  color,
  fill,
}: {
  label: string;
  value: number;
  detail: string;
  color: string;
  fill: string;
}) {
  return (
    <div
      className="flex items-center justify-between border-2 border-black px-4 py-3"
      style={{ backgroundColor: fill }}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
          {label}
        </p>
        <p className="mt-1 text-xs text-on-surface-variant">{detail}</p>
      </div>
      <p className="font-headline text-2xl font-bold" style={{ color }}>
        {value.toLocaleString("en-US")}
      </p>
    </div>
  );
}
