import React, { useState } from 'react';
import { SavingsGoal, FinancialMetrics } from '../types/finance';
import { formatINR } from '../utils/formatters';
import { PiggyBank, Plus, Target, ArrowDownCircle, ArrowUpCircle, Trash2, Calendar, CheckCircle } from 'lucide-react';

interface SavingsGoalsManagerProps {
  goals: SavingsGoal[];
  metrics: FinancialMetrics;
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  onDepositToGoal: (goalId: string, amount: number) => void;
  onWithdrawFromGoal: (goalId: string, amount: number) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const SavingsGoalsManager: React.FC<SavingsGoalsManagerProps> = ({
  goals,
  metrics,
  onAddGoal,
  onDepositToGoal,
  onWithdrawFromGoal,
  onDeleteGoal,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('2500');
  const [newSaved, setNewSaved] = useState('500');
  const [newDeadline, setNewDeadline] = useState('28');

  // Modals for Deposit & Withdraw
  const [activeActionGoal, setActiveActionGoal] = useState<SavingsGoal | null>(null);
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [transferAmount, setTransferAmount] = useState('200');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTarget);
    const saved = parseFloat(newSaved) || 0;
    const deadline = parseInt(newDeadline, 10);
    if (!newTitle.trim() || isNaN(target) || target <= 0 || isNaN(deadline)) {
      return;
    }

    onAddGoal({
      title: newTitle.trim(),
      targetAmount: target,
      currentSaved: saved,
      deadlineDay: deadline,
      category: 'savings',
    });

    setNewTitle('');
    setNewTarget('2500');
    setNewSaved('0');
    setIsAdding(false);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActionGoal) return;
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (actionType === 'deposit') {
      onDepositToGoal(activeActionGoal.id, amount);
    } else {
      onWithdrawFromGoal(activeActionGoal.id, amount);
    }

    setActiveActionGoal(null);
    setTransferAmount('200');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              30-Day Savings Goals
            </h3>
            <span className="text-xs font-mono font-semibold text-emerald-300 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
              {formatINR(metrics.totalSavingsAllocated)} locked in
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Save towards mini milestones within your ₹10k monthly cycle (like travel, concert passes, or an emergency buffer). Money locked in goals is protected from impulse spending.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-lime-400 hover:bg-lime-300 rounded-lg transition-colors whitespace-nowrap self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Inline Goal Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateSubmit}
          className="rounded-2xl bg-slate-900 border border-lime-400/30 p-5 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs uppercase tracking-wider font-bold text-lime-400">
              Create New Savings Goal
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-500 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Goal Name
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Goa Trip Fund, Noise-cancelling Buds"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Target Amount (₹)
              </label>
              <input
                type="number"
                required
                min="1"
                step="50"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono tabular-nums focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Initial Saved (₹)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={newSaved}
                onChange={(e) => setNewSaved(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono tabular-nums focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Deadline Day
              </label>
              <input
                type="number"
                required
                min="1"
                max="30"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono tabular-nums focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-lime-400 hover:bg-lime-300 rounded-lg transition-colors"
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const progressPct = Math.min(
            100,
            Math.round((goal.currentSaved / goal.targetAmount) * 100)
          );
          const shortfall = Math.max(0, goal.targetAmount - goal.currentSaved);
          const isAchievable = metrics.availableToSpend >= shortfall;
          const isCompleted = goal.currentSaved >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight">
                      {goal.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Target: Day {goal.deadlineDay} of 30
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-400 font-mono">
                        {goal.deadlineDay >= metrics.currentDay
                          ? `${goal.deadlineDay - metrics.currentDay} days left`
                          : 'Due date passed'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    title="Delete Goal"
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar and values */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-baseline justify-between font-mono">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-white tabular-nums">
                        {formatINR(goal.currentSaved)}
                      </span>
                      <span className="text-xs text-slate-500">
                        / {formatINR(goal.targetAmount)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400">
                      {progressPct}%
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${progressPct}%` }}
                      className={`h-full transition-all duration-500 ${
                        isCompleted ? 'bg-lime-400' : 'bg-emerald-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Achievability badge & explanation */}
                <div className="mt-3 text-xs flex items-center justify-between">
                  {isCompleted ? (
                    <span className="text-lime-400 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Goal reached!
                    </span>
                  ) : isAchievable ? (
                    <span className="text-emerald-400 font-medium">
                      ✓ Achievable with current pace (₹{shortfall} to go)
                    </span>
                  ) : (
                    <span className="text-amber-400 font-medium">
                      ⚠ Tight (₹{shortfall} needed, ₹{metrics.availableToSpend} free)
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons: Deposit or Withdraw */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setActiveActionGoal(goal);
                    setActionType('withdraw');
                    setTransferAmount('200');
                  }}
                  disabled={goal.currentSaved <= 0}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowUpCircle className="w-3.5 h-3.5" />
                  <span>Withdraw</span>
                </button>
                <button
                  onClick={() => {
                    setActiveActionGoal(goal);
                    setActionType('deposit');
                    setTransferAmount('200');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowDownCircle className="w-3.5 h-3.5" />
                  <span>Deposit Funds</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transfer Modal Dialog */}
      {activeActionGoal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-white tracking-tight">
              {actionType === 'deposit' ? 'Add Funds to Goal' : 'Withdraw from Goal'}
            </h4>
            <p className="text-xs text-slate-400">
              {actionType === 'deposit'
                ? `Transfer money from your Available Budget into "${activeActionGoal.title}".`
                : `Return funds from "${activeActionGoal.title}" back to your Available Budget.`}
            </p>

            <form onSubmit={handleExecuteTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={
                    actionType === 'deposit'
                      ? metrics.availableToSpend
                      : activeActionGoal.currentSaved
                  }
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono tabular-nums focus:outline-none focus:border-lime-400"
                />
                <div className="text-[11px] text-slate-500 mt-1 font-mono">
                  {actionType === 'deposit'
                    ? `Max available: ${formatINR(metrics.availableToSpend)}`
                    : `Currently in goal: ${formatINR(activeActionGoal.currentSaved)}`}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveActionGoal(null)}
                  className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-lime-400 hover:bg-lime-300 rounded-lg transition-colors"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
