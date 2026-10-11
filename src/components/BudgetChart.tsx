import React, { useState } from 'react';
import { Transaction, FinancialMetrics, SimulationComparison } from '../types/finance';
import { formatINR } from '../utils/formatters';
import { TrendingUp, AlertTriangle, Info, ChevronLeft, ChevronRight } from 'lucide-react';

interface BudgetChartProps {
  transactions: Transaction[];
  metrics: FinancialMetrics;
  simulationComparison: SimulationComparison | null;
  onSetCurrentDay: (day: number) => void;
}

export const BudgetChart: React.FC<BudgetChartProps> = ({
  transactions,
  metrics,
  simulationComparison,
  onSetCurrentDay,
}) => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [chartMode, setChartMode] = useState<'cumulative' | 'daily'>('cumulative');

  // Compute daily spend array from Day 1 to 30
  const dailySpend: number[] = new Array(31).fill(0);
  transactions.forEach((tx) => {
    if (tx.day >= 1 && tx.day <= 30) {
      if (tx.type === 'expense') {
        dailySpend[tx.day] += tx.amount;
      } else if (tx.type === 'refund') {
        dailySpend[tx.day] -= tx.amount;
      }
    }
  });

  // Cumulative spend array
  const cumulativeSpend: number[] = new Array(31).fill(0);
  let running = 0;
  for (let d = 1; d <= 30; d++) {
    if (d <= metrics.currentDay) {
      running += dailySpend[d];
      cumulativeSpend[d] = running;
    }
  }

  // Ideal pace array: d * (10000 / 30)
  const idealPace: number[] = new Array(31).fill(0);
  for (let d = 1; d <= 30; d++) {
    idealPace[d] = Math.round((d / 30) * metrics.startingBudget);
  }

  // Baseline projected trajectory from currentDay to 30
  const projectedSpend: (number | null)[] = new Array(31).fill(null);
  const spentSoFar = cumulativeSpend[metrics.currentDay] || 0;
  const daysRemaining = Math.max(1, 30 - metrics.currentDay);
  const projectedExtra = metrics.projectedMonthEndSpend - spentSoFar;
  
  for (let d = metrics.currentDay; d <= 30; d++) {
    const fraction = (d - metrics.currentDay) / (daysRemaining || 1);
    projectedSpend[d] = Math.round(spentSoFar + fraction * projectedExtra);
  }

  // Simulated trajectory if active
  const simulatedSpend: (number | null)[] = new Array(31).fill(null);
  const isSimulating = !!(simulationComparison && simulationComparison.projected.totalSpent !== metrics.totalSpent);
  
  if (isSimulating && simulationComparison) {
    const simSpentSoFar = spentSoFar + (simulationComparison.projected.totalSpent - metrics.totalSpent);
    const simMonthEnd = simulationComparison.projected.projectedMonthEndSpend;
    const simExtra = simMonthEnd - simSpentSoFar;
    for (let d = metrics.currentDay; d <= 30; d++) {
      const fraction = (d - metrics.currentDay) / (daysRemaining || 1);
      simulatedSpend[d] = Math.round(simSpentSoFar + fraction * simExtra);
    }
  }

  // SVG dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 40, left: 55 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;
  const maxBudget = 11000; // room for ₹10k limit

  const getX = (day: number) => padding.left + ((day - 1) / 29) * graphWidth;
  const getY = (val: number) => padding.top + graphHeight - (Math.min(val, maxBudget) / maxBudget) * graphHeight;

  // Paths
  // 1. Ideal line
  const idealPoints = Array.from({ length: 30 }, (_, i) => i + 1)
    .map((d) => `${getX(d)},${getY(idealPace[d])}`)
    .join(' L ');
  const idealPath = `M ${getX(1)},${getY(idealPace[1])} L ${idealPoints}`;

  // 2. Actual line
  const actualPoints = Array.from({ length: metrics.currentDay }, (_, i) => i + 1)
    .map((d) => `${getX(d)},${getY(cumulativeSpend[d])}`)
    .join(' L ');
  const actualPath = `M ${getX(1)},${getY(cumulativeSpend[1])} L ${actualPoints}`;

  // 2b. Actual Area fill
  const actualArea = `M ${getX(1)},${getY(0)} L ${actualPoints} L ${getX(metrics.currentDay)},${getY(0)} Z`;

  // 3. Projected line
  const projectedPoints = Array.from({ length: 30 - metrics.currentDay + 1 }, (_, i) => metrics.currentDay + i)
    .map((d) => `${getX(d)},${getY(projectedSpend[d] || 0)}`)
    .join(' L ');
  const projectedPath = `M ${getX(metrics.currentDay)},${getY(spentSoFar)} L ${projectedPoints}`;

  // 4. Simulated line
  let simulatedPath = '';
  if (isSimulating && simulationComparison) {
    const simPoints = Array.from({ length: 30 - metrics.currentDay + 1 }, (_, i) => metrics.currentDay + i)
      .map((d) => `${getX(d)},${getY(simulatedSpend[d] || 0)}`)
      .join(' L ');
    simulatedPath = `M ${getX(metrics.currentDay)},${getY(simulatedSpend[metrics.currentDay] || 0)} L ${simPoints}`;
  }

  // Active hover info
  const inspectDay = hoveredDay !== null ? hoveredDay : metrics.currentDay;
  const inspectSpend = inspectDay <= metrics.currentDay ? cumulativeSpend[inspectDay] : projectedSpend[inspectDay];
  const inspectIdeal = idealPace[inspectDay];
  const inspectDiff = (inspectSpend || 0) - inspectIdeal;
  const dayTxCount = transactions.filter((t) => t.day === inspectDay).length;

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-lime-400" />
              30-Day Spending Trajectory
            </h3>
            {metrics.willExhaustEarly && (
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1 font-mono">
                <AlertTriangle className="w-3.5 h-3.5" /> Runs out Day {metrics.exhaustionDay}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare actual burn vs ideal ₹333/day pace and month-end forecast
          </p>
        </div>

        {/* View toggle & Day Controller */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Day progression control */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => onSetCurrentDay(Math.max(1, metrics.currentDay - 1))}
              disabled={metrics.currentDay <= 1}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono font-semibold text-slate-200">
              Day {metrics.currentDay} of 30
            </span>
            <button
              onClick={() => onSetCurrentDay(Math.min(30, metrics.currentDay + 1))}
              disabled={metrics.currentDay >= 30}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              title="Advance to Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-1 text-xs font-medium">
            <button
              onClick={() => setChartMode('cumulative')}
              className={`px-2.5 py-1 rounded transition-colors ${
                chartMode === 'cumulative'
                  ? 'bg-slate-800 text-lime-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Trajectory
            </button>
            <button
              onClick={() => setChartMode('daily')}
              className={`px-2.5 py-1 rounded transition-colors ${
                chartMode === 'daily'
                  ? 'bg-slate-800 text-lime-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daily Spends
            </button>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none overflow-visible"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a3e635" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a3e635" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 2500, 5000, 7500, 10000].map((val) => (
            <g key={val}>
              <line
                x1={padding.left}
                y1={getY(val)}
                x2={width - padding.right}
                y2={getY(val)}
                stroke={val === 10000 ? '#f43f5e' : '#1e293b'}
                strokeWidth={val === 10000 ? '1.5' : '1'}
                strokeDasharray={val === 10000 ? '4 4' : 'none'}
              />
              <text
                x={padding.left - 8}
                y={getY(val) + 4}
                textAnchor="end"
                className="text-[10px] fill-slate-500 font-mono"
              >
                ₹{val >= 1000 ? `${val / 1000}k` : val}
              </text>
            </g>
          ))}

          {/* ₹10,000 Budget Ceiling Label */}
          <text
            x={width - padding.right}
            y={getY(10000) - 6}
            textAnchor="end"
            className="text-[10px] fill-rose-400 font-mono font-semibold"
          >
            ₹10k Limit
          </text>

          {/* Current Day vertical marker */}
          <line
            x1={getX(metrics.currentDay)}
            y1={padding.top}
            x2={getX(metrics.currentDay)}
            y2={height - padding.bottom}
            stroke="#64748b"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <text
            x={getX(metrics.currentDay)}
            y={padding.top - 6}
            textAnchor="middle"
            className="text-[10px] fill-slate-300 font-mono font-medium"
          >
            Today (Day {metrics.currentDay})
          </text>

          {chartMode === 'cumulative' ? (
            <>
              {/* Ideal linear pace line (dashed white/gray) */}
              <path
                d={idealPath}
                fill="none"
                stroke="#475569"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Actual area fill */}
              <path d={actualArea} fill="url(#areaGrad)" />

              {/* Actual solid line */}
              <path
                d={actualPath}
                fill="none"
                stroke="#a3e635"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Projected trajectory (dashed lime) */}
              <path
                d={projectedPath}
                fill="none"
                stroke={metrics.willExhaustEarly ? '#fb7185' : '#84cc16'}
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Simulated decision trajectory if active */}
              {isSimulating && (
                <path
                  d={simulatedPath}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                />
              )}

              {/* Dots on actual data points */}
              {Array.from({ length: metrics.currentDay }, (_, i) => i + 1).map((d) => (
                <circle
                  key={d}
                  cx={getX(d)}
                  cy={getY(cumulativeSpend[d])}
                  r={d === metrics.currentDay ? 5 : 2.5}
                  fill={d === metrics.currentDay ? '#a3e635' : '#bef264'}
                  stroke="#070b14"
                  strokeWidth="1.5"
                />
              ))}

              {/* Simulated ending point dot */}
              {isSimulating && simulatedSpend[30] !== null && (
                <circle
                  cx={getX(30)}
                  cy={getY(simulatedSpend[30]!)}
                  r={4}
                  fill="#fbbf24"
                  stroke="#070b14"
                  strokeWidth="1.5"
                />
              )}
            </>
          ) : (
            /* Daily spend bars */
            Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
              const spend = dailySpend[d];
              const barHeight = (spend / maxBudget) * graphHeight;
              const isPast = d <= metrics.currentDay;
              return (
                <g key={d}>
                  {spend > 0 && (
                    <rect
                      x={getX(d) - 6}
                      y={getY(spend)}
                      width={12}
                      height={Math.max(2, barHeight)}
                      rx={2}
                      fill={isPast ? '#a3e635' : '#475569'}
                      opacity={isPast ? 0.9 : 0.4}
                    />
                  )}
                </g>
              );
            })
          )}

          {/* Interactive invisible hover rectangles for each day */}
          {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
            <rect
              key={`hit-${d}`}
              x={getX(d) - graphWidth / 58}
              y={padding.top}
              width={graphWidth / 29}
              height={graphHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredDay(d)}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={() => onSetCurrentDay(d)}
            />
          ))}

          {/* Hover crosshair */}
          {hoveredDay && (
            <line
              x1={getX(hoveredDay)}
              y1={padding.top}
              x2={getX(hoveredDay)}
              y2={height - padding.bottom}
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="2 2"
              pointerEvents="none"
            />
          )}

          {/* X Axis Day Labels */}
          {[1, 5, 10, 15, 20, 25, 30].map((d) => (
            <text
              key={`day-${d}`}
              x={getX(d)}
              y={height - padding.bottom + 18}
              textAnchor="middle"
              className="text-[10px] fill-slate-400 font-mono"
            >
              Day {d}
            </text>
          ))}
        </svg>
      </div>

      {/* Trajectory Legend & Inspected Day Details */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-lime-400 inline-block rounded" />
            <span>Actual Spend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-slate-400 inline-block" />
            <span>Ideal ₹333/day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-lime-500 inline-block" />
            <span>Projected</span>
          </div>
          {isSimulating && (
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <span className="w-3 h-0.5 border-t border-dashed border-amber-400 inline-block" />
              <span>Simulated Path</span>
            </div>
          )}
        </div>

        {/* Inspected Day Tooltip Bar */}
        <div className="flex items-center gap-3 font-mono bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-300 font-semibold">Day {inspectDay}:</span>
          <span className="text-white">
            {inspectSpend !== null ? formatINR(inspectSpend) : '—'}
          </span>
          <span className="text-slate-500 text-[11px]">
            (Target: {formatINR(inspectIdeal)})
          </span>
          {inspectSpend !== null && (
            <span
              className={`text-[11px] font-semibold ${
                inspectDiff <= 0 ? 'text-lime-400' : 'text-rose-400'
              }`}
            >
              {inspectDiff <= 0
                ? `${formatINR(Math.abs(inspectDiff))} under target`
                : `${formatINR(inspectDiff)} over target`}
            </span>
          )}
          {dayTxCount > 0 && (
            <span className="text-[11px] text-slate-400">
              · {dayTxCount} {dayTxCount === 1 ? 'tx' : 'txs'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
