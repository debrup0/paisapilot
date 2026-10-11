import React, { useState } from 'react';
import {
  CategoryId,
  FinancialMetrics,
  SimulationProposal,
  SimulationComparison,
} from '../types/finance';
import { CATEGORIES, formatINR } from '../utils/formatters';
import { SCENARIO_PRESETS, ScenarioPreset } from '../utils/demoData';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Zap,
  TrendingDown,
  ShieldCheck,
  Flame,
} from 'lucide-react';

interface DecisionSimulatorProps {
  metrics: FinancialMetrics;
  simulationProposal: SimulationProposal;
  simulationComparison: SimulationComparison;
  onUpdateProposal: (proposal: SimulationProposal) => void;
  onConfirmDecision: () => void;
  onCancelSimulation: () => void;
}

export const DecisionSimulator: React.FC<DecisionSimulatorProps> = ({
  metrics,
  simulationProposal,
  simulationComparison,
  onUpdateProposal,
  onConfirmDecision,
  onCancelSimulation,
}) => {
  const [customTitle, setCustomTitle] = useState(simulationProposal.title || '');
  const [customAmount, setCustomAmount] = useState(
    simulationProposal.amount > 0 ? simulationProposal.amount.toString() : ''
  );
  const [customCategory, setCustomCategory] = useState<CategoryId>(
    simulationProposal.category || 'food'
  );
  const [customRecurring, setCustomRecurring] = useState(
    simulationProposal.isRecurring || false
  );

  const handleApplyPreset = (preset: ScenarioPreset) => {
    setCustomTitle(preset.title);
    setCustomAmount(preset.amount.toString());
    setCustomCategory(preset.category);
    setCustomRecurring(preset.isRecurring);

    onUpdateProposal({
      isActive: true,
      title: preset.title,
      amount: preset.amount,
      category: preset.category,
      isRecurring: preset.isRecurring,
      scenarioPresetId: preset.id,
    });
  };

  const handleFormChange = (
    title: string,
    amountStr: string,
    category: CategoryId,
    recurring: boolean
  ) => {
    setCustomTitle(title);
    setCustomAmount(amountStr);
    setCustomCategory(category);
    setCustomRecurring(recurring);

    const numericAmount = Math.max(0, parseFloat(amountStr) || 0);
    if (numericAmount > 0) {
      onUpdateProposal({
        isActive: true,
        title: title || 'Custom Simulated Expense',
        amount: numericAmount,
        category,
        isRecurring: recurring,
      });
    } else {
      onCancelSimulation();
    }
  };

  const isSimulating = simulationProposal.isActive && simulationProposal.amount > 0;
  const { current, projected, deltaAvailable, deltaDailyAllowance, deltaHealthScore, riskShift } =
    simulationComparison;

  return (
    <div className="space-y-6">
      {/* Simulation Banner Notice */}
      <div
        className={`rounded-2xl p-4 sm:p-5 transition-all border ${
          isSimulating
            ? 'bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 border-amber-500/40 shadow-lg'
            : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isSimulating ? 'bg-amber-400/20 text-amber-300' : 'bg-lime-400/10 text-lime-400'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Financial Decision Simulator
                </h3>
                {isSimulating ? (
                  <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                    SIMULATION ACTIVE
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-mono">
                    Sandbox Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Stress-test any purchase against your ₹10,000 budget before spending a single rupee.
              </p>
            </div>
          </div>

          {isSimulating && (
            <div className="flex items-center gap-2">
              <button
                onClick={onCancelSimulation}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={onConfirmDecision}
                className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-lime-400 hover:bg-lime-300 active:bg-lime-500 rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Decision</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Scenario Presets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-lime-400" /> Quick-Test Real Life Scenarios
          </span>
          <span className="text-xs text-slate-500">Tap to load scenario</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SCENARIO_PRESETS.map((preset) => {
            const isSelected =
              isSimulating && simulationProposal.scenarioPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-amber-400/10 border-amber-400 text-white shadow-md'
                    : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400 font-mono">
                    {preset.badge}
                  </span>
                  <span className="text-sm font-bold text-white font-mono tabular-nums">
                    {formatINR(preset.amount)}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-white mt-1.5 line-clamp-1">
                  {preset.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Simulation Input Controls */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-300">
          Or Enter a Custom Proposed Expense
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <label htmlFor="sim-expense-title" className="block text-[11px] font-medium text-slate-300 mb-1">
              Expense Title / Description
            </label>
            <input
              id="sim-expense-title"
              type="text"
              placeholder="e.g., Zomato dinner, New earbuds, Doctor visit"
              value={customTitle}
              onChange={(e) =>
                handleFormChange(e.target.value, customAmount, customCategory, customRecurring)
              }
              className="w-full bg-slate-950 border border-slate-800 focus:border-lime-400 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="sim-expense-amount" className="block text-[11px] font-medium text-slate-300 mb-1">
              Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm text-slate-400 font-mono" aria-hidden="true">₹</span>
              <input
                id="sim-expense-amount"
                type="number"
                min="1"
                step="10"
                placeholder="500"
                value={customAmount}
                onChange={(e) =>
                  handleFormChange(customTitle, e.target.value, customCategory, customRecurring)
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-lime-400 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono tabular-nums placeholder-slate-500"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="sim-expense-category" className="block text-[11px] font-medium text-slate-300 mb-1">
              Category
            </label>
            <select
              id="sim-expense-category"
              value={customCategory}
              onChange={(e) =>
                handleFormChange(
                  customTitle,
                  customAmount,
                  e.target.value as CategoryId,
                  customRecurring
                )
              }
              className="w-full bg-slate-950 border border-slate-800 focus:border-lime-400 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none rounded-lg px-3 py-2 text-sm text-white"
            >
              {Object.values(CATEGORIES).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label htmlFor="sim-expense-recurring" className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              id="sim-expense-recurring"
              type="checkbox"
              checked={customRecurring}
              onChange={(e) =>
                handleFormChange(customTitle, customAmount, customCategory, e.target.checked)
              }
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-lime-400 focus:ring-0 focus-visible:ring-2 focus-visible:ring-lime-400"
            />
            <span>This is a recurring monthly commitment</span>
          </label>

          {isSimulating && (
            <span className="text-xs font-mono text-amber-300 font-semibold">
              Testing expense of {formatINR(simulationProposal.amount)}
            </span>
          )}
        </div>
      </div>

      {/* Side-by-Side Comparison Section */}
      {isSimulating ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-amber-400" /> Side-by-Side Impact Comparison
            </h4>
            <span className="text-xs text-slate-400">
              Day {metrics.currentDay} · {metrics.remainingDays} days remaining
            </span>
          </div>

          {/* Side-by-side cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Financial Reality */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                    Current Position
                  </span>
                  <p className="text-xs text-slate-500">Without this purchase</p>
                </div>
                <span className="text-xs font-semibold text-lime-400 bg-lime-400/10 px-2.5 py-1 rounded-full">
                  Confirmed
                </span>
              </div>

              <div className="space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-sans">Available to spend</span>
                  <span className="font-bold text-white text-base">
                    {formatINR(current.availableToSpend)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-sans">Daily allowance</span>
                  <span className="font-semibold text-slate-200">
                    {formatINR(Math.round(current.dailyAllowance))}/day
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-sans">Month-end projection</span>
                  <span
                    className={`font-semibold ${
                      current.projectedMonthEndBalance >= 0 ? 'text-lime-400' : 'text-rose-400'
                    }`}
                  >
                    {current.projectedMonthEndBalance >= 0 ? '+' : ''}
                    {formatINR(current.projectedMonthEndBalance)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-sans">Health score</span>
                  <span className="font-semibold text-slate-200">
                    {current.healthScore}/100
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-sans">Risk category</span>
                  <span className="capitalize font-semibold text-slate-300">
                    {current.riskLevel} Risk
                  </span>
                </div>
              </div>
            </div>

            {/* Position After Decision */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/50 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-amber-300">
                    Projected Position
                  </span>
                  <p className="text-xs text-slate-400">
                    If you confirm {formatINR(simulationProposal.amount)}
                  </p>
                </div>
                <span className="text-xs font-semibold text-amber-300 bg-amber-400/20 px-2.5 py-1 rounded-full border border-amber-400/30">
                  Simulated
                </span>
              </div>

              <div className="space-y-3 font-mono">
                {/* Available diff */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-sans">Available to spend</span>
                  <div className="text-right">
                    <span
                      className={`font-bold text-base ${
                        projected.availableToSpend < 0 ? 'text-rose-400' : 'text-amber-300'
                      }`}
                    >
                      {formatINR(projected.availableToSpend)}
                    </span>
                    <span className="text-[11px] text-rose-400 ml-2">
                      ({formatINR(deltaAvailable)})
                    </span>
                  </div>
                </div>

                {/* Daily allowance diff */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-sans">Daily allowance</span>
                  <div className="text-right">
                    <span className="font-semibold text-white">
                      {formatINR(Math.round(projected.dailyAllowance))}/day
                    </span>
                    <span className="text-[11px] text-rose-400 ml-2">
                      ({formatINR(Math.round(deltaDailyAllowance))}/day)
                    </span>
                  </div>
                </div>

                {/* Month end projection diff */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-sans">Month-end projection</span>
                  <div className="text-right">
                    <span
                      className={`font-semibold ${
                        projected.projectedMonthEndBalance >= 0 ? 'text-lime-400' : 'text-rose-400'
                      }`}
                    >
                      {projected.projectedMonthEndBalance >= 0 ? '+' : ''}
                      {formatINR(projected.projectedMonthEndBalance)}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      ({formatINR(simulationComparison.deltaMonthEndBalance)})
                    </span>
                  </div>
                </div>

                {/* Health score diff */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-sans">Health score</span>
                  <div className="text-right">
                    <span className="font-semibold text-white">
                      {projected.healthScore}/100
                    </span>
                    <span className="text-[11px] text-rose-400 ml-2">
                      ({deltaHealthScore} pts)
                    </span>
                  </div>
                </div>

                {/* Risk category shift */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-sans">Risk category</span>
                  <div className="text-right flex items-center gap-1.5">
                    <span className="capitalize font-semibold text-slate-300">
                      {projected.riskLevel} Risk
                    </span>
                    {riskShift.changed && (
                      <span className="text-[10px] text-rose-400 font-bold uppercase">
                        (Increased Risk!)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Goal & Feasibility Verdict Card */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
            <div className="flex items-start gap-3">
              {simulationComparison.feasibilityWarning ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-white">
                  Decision Impact Assessment
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {simulationComparison.goalImpactSummary}
                </p>
                {simulationComparison.feasibilityWarning && (
                  <p className="text-xs text-rose-400 font-medium">
                    {simulationComparison.feasibilityWarning}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Final Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              onClick={onCancelSimulation}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Discard Simulation
            </button>
            <button
              onClick={onConfirmDecision}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-slate-950 bg-lime-400 hover:bg-lime-300 active:bg-lime-500 rounded-xl shadow-lg shadow-lime-500/20 transition-all inline-flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Deduct {formatINR(simulationProposal.amount)}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty prompt state */
        <div className="text-center py-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 p-6">
          <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-white">No active simulation</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Pick a preset above or enter an amount to see how your daily allowance, savings goals, and month-end balance will adjust.
          </p>
        </div>
      )}
    </div>
  );
};
