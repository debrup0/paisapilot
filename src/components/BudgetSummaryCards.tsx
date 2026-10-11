import React from 'react';
import { formatINR } from '../utils/formatters';
import { FinancialMetrics } from '../types/finance';
import { Wallet, ShieldAlert, Sparkles, Calendar, Layers, PiggyBank } from 'lucide-react';

interface BudgetSummaryCardsProps {
  metrics: FinancialMetrics;
  onOpenSimulator: () => void;
  onNavigateToCommitments: () => void;
  onNavigateToGoals: () => void;
}

export const BudgetSummaryCards: React.FC<BudgetSummaryCardsProps> = ({
  metrics,
  onOpenSimulator,
  onNavigateToCommitments,
  onNavigateToGoals,
}) => {
  const percentSpent = Math.min(100, Math.round((metrics.totalSpent / metrics.startingBudget) * 100));
  const percentCommitted = Math.min(
    100,
    Math.round((metrics.committedUpcoming / metrics.startingBudget) * 100)
  );
  const percentSaved = Math.min(
    100,
    Math.round((metrics.totalSavingsAllocated / metrics.startingBudget) * 100)
  );
  const percentAvailable = Math.max(
    0,
    Math.round((metrics.availableToSpend / metrics.startingBudget) * 100)
  );

  return (
    <div className="space-y-4">
      {/* Primary Hero Row: Available to spend + Daily Allowance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Available to Spend - Hero Card */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0d1627] to-slate-900 border border-slate-800 p-6 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-lime-400 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" /> Available To Spend
                </span>
                <p className="text-slate-400 text-xs mt-1">
                  Truly unreserved money after deducting upcoming bills and savings
                </p>
              </div>
              <button
                onClick={onOpenSimulator}
                className="text-xs text-lime-400 hover:text-lime-300 font-medium inline-flex items-center gap-1 transition-colors"
              >
                <span>Test a Purchase</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono tabular-nums">
                  {formatINR(metrics.availableToSpend)}
                </span>
                <span className="text-sm font-medium text-slate-400">
                  of {formatINR(metrics.startingBudget)}
                </span>
              </div>

              {/* Math breakdown ticker */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
                <span className="text-slate-300">{formatINR(metrics.remainingBalance)} balance</span>
                <span aria-hidden="true">−</span>
                <span className="text-amber-300">{formatINR(metrics.committedUpcoming)} bills</span>
                <span aria-hidden="true">−</span>
                <span className="text-emerald-300">{formatINR(metrics.totalSavingsAllocated)} goals</span>
                <span aria-hidden="true">=</span>
                <span className="text-lime-400 font-bold">{formatINR(metrics.availableToSpend)} free</span>
              </div>
            </div>

            {/* Micro progress visualizer */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Budget allocation</span>
                <span>{percentAvailable}% liquid</span>
              </div>
              <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${percentSpent}%` }}
                  className="bg-rose-500 h-full transition-all duration-500"
                  title={`Spent: ${percentSpent}%`}
                />
                <div
                  style={{ width: `${percentCommitted}%` }}
                  className="bg-amber-400 h-full transition-all duration-500"
                  title={`Committed: ${percentCommitted}%`}
                />
                <div
                  style={{ width: `${percentSaved}%` }}
                  className="bg-emerald-400 h-full transition-all duration-500"
                  title={`Saved: ${percentSaved}%`}
                />
                <div
                  style={{ width: `${percentAvailable}%` }}
                  className="bg-lime-400 h-full transition-all duration-500"
                  title={`Available: ${percentAvailable}%`}
                />
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Spent ({formatINR(metrics.totalSpent)})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Bills ({formatINR(metrics.committedUpcoming)})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Goals ({formatINR(metrics.totalSavingsAllocated)})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-lime-400" /> Free ({formatINR(metrics.availableToSpend)})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Allowance & Pacing Card */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-lime-400" /> Daily Allowance
              </span>
              <span className="text-xs font-mono text-slate-300">
                {metrics.remainingDays} days left
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Spendable per day to finish Day 30 without exceeding ₹10,000
            </p>

            <div className="mt-5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">
                  {formatINR(Math.round(metrics.dailyAllowance))}
                </span>
                <span className="text-xs text-slate-400">/ day</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Baseline ideal: <span className="font-mono text-slate-300">{formatINR(Math.round(metrics.idealDailyBudget))}/day</span>
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              <span>Avg burn rate so far: </span>
              <span className="font-mono text-slate-200 font-semibold">
                {formatINR(Math.round(metrics.actualDailyBurnRate))}/day
              </span>
            </div>
            <div className="text-right">
              {metrics.dailyAllowance >= metrics.idealDailyBudget * 0.9 ? (
                <span className="text-xs font-medium text-lime-400">
                  Comfortable pace
                </span>
              ) : (
                <span className="text-xs font-medium text-amber-400">
                  Tight allowance
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary 4-Column Stat Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Remaining Overall Balance */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Remaining Balance</span>
            <Wallet className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-xl font-bold text-white mt-2 font-mono tabular-nums">
            {formatINR(metrics.remainingBalance)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Total ₹10k minus ₹{metrics.totalSpent} spent
          </div>
        </div>

        {/* Total Spent */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Spent</span>
            <span className="text-[10px] font-mono text-rose-400 font-semibold">{percentSpent}%</span>
          </div>
          <div className="text-xl font-bold text-rose-400 mt-2 font-mono tabular-nums">
            {formatINR(metrics.totalSpent)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 30-day budget period
          </div>
        </div>

        {/* Committed Bills */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4 cursor-pointer hover:border-slate-700 transition-colors" onClick={onNavigateToCommitments}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Committed Dues</span>
            <Layers className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 mt-2 font-mono tabular-nums">
            {formatINR(metrics.committedUpcoming)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Reserved for bills</span>
            <span className="text-slate-400 hover:text-white">View &rarr;</span>
          </div>
        </div>

        {/* Savings Allocated */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4 cursor-pointer hover:border-slate-700 transition-colors" onClick={onNavigateToGoals}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Savings Reserved</span>
            <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-2 font-mono tabular-nums">
            {formatINR(metrics.totalSavingsAllocated)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Protected for goals</span>
            <span className="text-slate-400 hover:text-white">View &rarr;</span>
          </div>
        </div>
      </div>
    </div>
  );
};
