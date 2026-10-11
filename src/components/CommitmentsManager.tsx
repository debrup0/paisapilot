import React, { useState } from 'react';
import { Commitment, CategoryId } from '../types/finance';
import { CATEGORIES, formatINR } from '../utils/formatters';
import { Layers, Plus, CheckCircle, Trash2, Calendar, AlertCircle } from 'lucide-react';

interface CommitmentsManagerProps {
  commitments: Commitment[];
  currentDay: number;
  onAddCommitment: (commitment: Omit<Commitment, 'id' | 'createdAt'>) => void;
  onMarkAsPaid: (id: string) => void;
  onDeleteCommitment: (id: string) => void;
}

export const CommitmentsManager: React.FC<CommitmentsManagerProps> = ({
  commitments,
  currentDay,
  onAddCommitment,
  onMarkAsPaid,
  onDeleteCommitment,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDay, setNewDueDay] = useState('20');
  const [newCategory, setNewCategory] = useState<CategoryId>('bills');
  const [newRecurring, setNewRecurring] = useState(true);

  const pendingCommitments = commitments.filter((c) => c.status === 'pending');
  const paidCommitments = commitments.filter((c) => c.status === 'paid');
  const totalPending = pendingCommitments.reduce((sum, c) => sum + c.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newAmount);
    const day = parseInt(newDueDay, 10);
    if (!newTitle.trim() || isNaN(amount) || amount <= 0 || isNaN(day) || day < 1 || day > 30) {
      return;
    }

    onAddCommitment({
      title: newTitle.trim(),
      amount,
      dueDay: day,
      category: newCategory,
      isRecurring: newRecurring,
      status: 'pending',
    });

    setNewTitle('');
    setNewAmount('');
    setNewDueDay('20');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview & Philosophy Card */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Planned Commitments & Dues
            </h3>
            <span className="text-xs font-mono font-semibold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              {formatINR(totalPending)} reserved
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Committed expenses are ring-fenced from your daily allowance so you never accidentally spend rent, Wi-Fi, or subscription money. They only convert to confirmed spend once marked paid.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-lime-400 hover:bg-lime-300 rounded-lg transition-colors whitespace-nowrap self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Commitment</span>
        </button>
      </div>

      {/* Inline Add Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-slate-900 border border-lime-400/30 p-5 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs uppercase tracking-wider font-bold text-lime-400">
              New Planned Commitment / Subscription
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
                Name (e.g. Wi-Fi bill, Gym pass, Netflix)
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Hostel Wi-Fi"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Amount (₹ INR)
              </label>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="400"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono tabular-nums focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Due Day (1-30)
              </label>
              <input
                type="number"
                required
                min="1"
                max="30"
                value={newDueDay}
                onChange={(e) => setNewDueDay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono tabular-nums focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as CategoryId)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-sm text-white focus:outline-none focus:border-lime-400"
              >
                {Object.values(CATEGORIES).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
              <input
                type="checkbox"
                checked={newRecurring}
                onChange={(e) => setNewRecurring(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-lime-400 focus:ring-0"
              />
              <span>Recurring monthly commitment</span>
            </label>

            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-lime-400 hover:bg-lime-300 rounded-lg transition-colors"
            >
              Save Commitment
            </button>
          </div>
        </form>
      )}

      {/* Pending Commitments List */}
      <div className="space-y-3">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
          Upcoming Unpaid Dues ({pendingCommitments.length})
        </h4>

        {pendingCommitments.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
            <CheckCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">No pending commitments</p>
            <p className="text-xs text-slate-500 mt-1">
              All planned subscriptions and bills for this 30-day cycle are settled.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingCommitments.map((com) => {
              const isDueSoon = com.dueDay >= currentDay && com.dueDay <= currentDay + 3;
              const isOverdue = com.dueDay < currentDay;
              const cat = CATEGORIES[com.category] || CATEGORIES.bills;

              return (
                <div
                  key={com.id}
                  className={`rounded-xl p-4 border transition-all bg-slate-900/80 flex flex-col justify-between space-y-3 ${
                    isOverdue
                      ? 'border-rose-500/40'
                      : isDueSoon
                      ? 'border-amber-500/40'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <h5 className="text-sm font-bold text-white tracking-tight">
                          {com.title}
                        </h5>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>{cat.label}</span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          Due Day {com.dueDay} of 30
                        </span>
                        {com.isRecurring && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-400">Monthly</span>
                          </>
                        )}
                      </div>
                    </div>

                    <span className="text-base font-bold text-white font-mono tabular-nums">
                      {formatINR(com.amount)}
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-[11px] font-mono">
                      {isOverdue ? (
                        <span className="text-rose-400 flex items-center gap-1 font-semibold">
                          <AlertCircle className="w-3 h-3" /> Due date passed
                        </span>
                      ) : isDueSoon ? (
                        <span className="text-amber-300 font-semibold">
                          Due in {com.dueDay - currentDay} days
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          Due in {com.dueDay - currentDay} days
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDeleteCommitment(com.id)}
                        title="Remove Commitment"
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onMarkAsPaid(com.id)}
                        className="px-3 py-1 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-md transition-colors inline-flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Mark Paid</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Paid History for Context */}
      {paidCommitments.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500">
            Settled Commitments This Month ({paidCommitments.length})
          </h4>
          <div className="space-y-2">
            {paidCommitments.map((com) => (
              <div
                key={com.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-900 text-xs text-slate-400 font-mono"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-lime-400" />
                  <span className="text-slate-300 font-sans">{com.title}</span>
                  <span className="text-slate-600">· Paid on Day {com.dueDay}</span>
                </div>
                <span className="text-slate-400 line-through">
                  {formatINR(com.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
