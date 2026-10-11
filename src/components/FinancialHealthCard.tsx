import React from 'react';
import { FinancialMetrics } from '../types/finance';
import { formatINR } from '../utils/formatters';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingDown,
  Info,
  Calendar,
} from 'lucide-react';

interface FinancialHealthCardProps {
  metrics: FinancialMetrics;
}

export const FinancialHealthCard: React.FC<FinancialHealthCardProps> = ({ metrics }) => {
  const getRiskBadge = () => {
    switch (metrics.riskLevel) {
      case 'low':
        return {
          label: 'Low Risk',
          textColor: 'text-lime-400',
          bgColor: 'bg-lime-400/10',
          borderColor: 'border-lime-400/30',
          icon: ShieldCheck,
          summary: 'Your pace is disciplined and liabilities are well covered.',
        };
      case 'moderate':
        return {
          label: 'Moderate Risk',
          textColor: 'text-amber-400',
          bgColor: 'bg-amber-400/10',
          borderColor: 'border-amber-400/30',
          icon: AlertTriangle,
          summary: 'Spending is slightly ahead of schedule. Moderate non-essential orders.',
        };
      case 'high':
        return {
          label: 'High Risk',
          textColor: 'text-rose-400',
          bgColor: 'bg-rose-400/10',
          borderColor: 'border-rose-400/30',
          icon: Flame,
          summary: 'High burn rate or low allowance threatens early budget exhaustion.',
        };
    }
  };

  const riskBadge = getRiskBadge();
  const RiskIcon = riskBadge.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Col: Health Score & 4 Transparent Factors */}
      <div className="lg:col-span-7 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-lime-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Financial Health Score
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic index (0–100) based on your pacing, commitments, and daily room
            </p>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${riskBadge.bgColor} ${riskBadge.textColor} ${riskBadge.borderColor}`}
          >
            <RiskIcon className="w-3.5 h-3.5" />
            <span>{riskBadge.label}</span>
          </div>
        </div>

        {/* Score gauge & overview */}
        <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-950/70 border border-slate-850">
          <div className="relative flex items-center justify-center shrink-0">
            <div className="text-center font-mono">
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {metrics.healthScore}
              </span>
              <span className="text-xs text-slate-400 block">/ 100</span>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white tracking-tight">
              {riskBadge.summary}
            </h4>
            <p className="text-[11px] text-slate-400">
              Evaluated across 4 mathematical metrics. Every change to your budget updates this score immediately.
            </p>
          </div>
        </div>

        {/* 4 Transparent Scoring Factors */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Score Breakdown
          </h4>

          <div className="space-y-2.5">
            {metrics.healthFactors.map((factor) => {
              const pct = Math.round((factor.score / factor.maxScore) * 100);
              return (
                <div
                  key={factor.name}
                  className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{factor.name}</span>
                    <span className="font-mono text-slate-300 font-semibold">
                      {factor.score} / {factor.maxScore} pts
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-valuenow={factor.score}
                    aria-valuemin={0}
                    aria-valuemax={factor.maxScore}
                    aria-label={factor.name}
                    className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"
                  >
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full transition-all duration-300 ${
                        factor.status === 'optimal'
                          ? 'bg-lime-400'
                          : factor.status === 'warning'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400">{factor.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Col: Month-End Forecast & Gen Z Recommendations */}
      <div className="lg:col-span-5 space-y-6">
        {/* Month-End Forecast Card */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-lime-400" />
              Month-End Forecast
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Day 30 Outlook
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-850 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-sans">Projected total spend</span>
              <span className="font-bold text-white">
                {formatINR(metrics.projectedMonthEndSpend)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-sans">₹10,000 Budget Cap</span>
              <span className="text-slate-400">{formatINR(metrics.startingBudget)}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-sans font-semibold">
                Projected month-end balance
              </span>
              <span
                className={`text-base font-extrabold ${
                  metrics.projectedMonthEndBalance >= 0 ? 'text-lime-400' : 'text-rose-400'
                }`}
              >
                {metrics.projectedMonthEndBalance >= 0 ? '+' : ''}
                {formatINR(metrics.projectedMonthEndBalance)}
              </span>
            </div>
          </div>

          {/* Depletion Warning */}
          {metrics.willExhaustEarly ? (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">Budget Exhaustion Warning</span>
                <p className="text-[11px] leading-relaxed">
                  At your current average burn rate of {formatINR(Math.round(metrics.actualDailyBurnRate))}/day, your unreserved funds will run out around <strong>Day {metrics.exhaustionDay}</strong> of 30.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-lime-400/10 border border-lime-400/20 text-lime-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
              <span>
                On track to complete all 30 days within your ₹10,000 limit with a buffer of {formatINR(metrics.projectedMonthEndBalance)}.
              </span>
            </div>
          )}
        </div>

        {/* Actionable Recommendations */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-3">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Tailored Recommendations
          </h4>

          <div className="space-y-2">
            {metrics.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-850"
              >
                <span className="text-lime-400 font-bold shrink-0 mt-0.5">•</span>
                <p className="leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
