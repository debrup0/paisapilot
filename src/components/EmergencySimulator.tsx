import React, { useState } from 'react';
import { FinancialMetrics, SimulationProposal } from '../types/finance';
import { formatINR } from '../utils/formatters';
import { AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';

interface EmergencySimulatorProps {
  metrics: FinancialMetrics;
  onSimulateEmergency: (proposal: SimulationProposal) => void;
  onConfirmEmergency: (amount: number, title: string) => void;
}

const EMERGENCY_PRESETS = [
  {
    title: 'Cracked Phone Screen Repair',
    amount: 1500,
    impactSummary: 'Consumes ~23% of remaining liquid budget',
  },
  {
    title: 'Sudden Dental/Doctor Urgent Visit',
    amount: 800,
    impactSummary: 'Reduces daily allowance by ~₹42/day',
  },
  {
    title: 'Surprise Electricity/AC Bill Split',
    amount: 1100,
    impactSummary: 'Pushes cushion close to minimum safe buffer',
  },
  {
    title: 'Emergency Surge Cab / Auto Trip',
    amount: 650,
    impactSummary: 'Mild shock, recoverable in 2 days',
  },
];

export const EmergencySimulator: React.FC<EmergencySimulatorProps> = ({
  metrics,
  onSimulateEmergency,
  onConfirmEmergency,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const activeAmount =
    selectedPreset !== null
      ? EMERGENCY_PRESETS[selectedPreset].amount
      : parseFloat(customAmount) || 0;
  const activeTitle =
    selectedPreset !== null
      ? EMERGENCY_PRESETS[selectedPreset].title
      : customTitle || 'Emergency Expense';

  const handleTestEmergency = (amount: number, title: string) => {
    setIsSimulating(true);
    onSimulateEmergency({
      isActive: true,
      title,
      amount,
      category: 'emergency',
      isRecurring: false,
    });
  };

  const handleApplyPreset = (idx: number) => {
    setSelectedPreset(idx);
    setCustomAmount('');
    setCustomTitle('');
    handleTestEmergency(EMERGENCY_PRESETS[idx].amount, EMERGENCY_PRESETS[idx].title);
  };

  const handleCustomTest = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(customAmount);
    if (isNaN(amt) || amt <= 0) return;
    setSelectedPreset(null);
    handleTestEmergency(amt, customTitle.trim() || 'Custom Emergency');
  };

  const handleReset = () => {
    setSelectedPreset(null);
    setCustomAmount('');
    setCustomTitle('');
    setIsSimulating(false);
    onSimulateEmergency({
      isActive: false,
      title: '',
      amount: 0,
      category: 'emergency',
      isRecurring: false,
    });
  };

  // Projected impact calculations
  const remainingDays = metrics.remainingDays;
  const newAvailable = metrics.availableToSpend - activeAmount;
  const newAllowance = Math.max(0, newAvailable) / remainingDays;
  const allowanceDrop = metrics.dailyAllowance - newAllowance;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-900 border border-rose-500/30 p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Emergency & Shock Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate an unplanned crisis and test if your ₹10k budget can absorb it without running out of money.
            </p>
          </div>
        </div>

        {isSimulating && (
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Emergency</span>
          </button>
        )}
      </div>

      {/* Quick Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {EMERGENCY_PRESETS.map((preset, idx) => {
          const isSelected = selectedPreset === idx;
          return (
            <button
              key={preset.title}
              onClick={() => handleApplyPreset(idx)}
              aria-label={`Test emergency scenario: ${preset.title} of ${formatINR(preset.amount)}`}
              className={`p-3.5 rounded-xl border text-left transition-all focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none ${
                isSelected
                  ? 'bg-rose-500/20 border-rose-400 text-white shadow-lg'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 font-mono">
                  {formatINR(preset.amount)}
                </span>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400/80" aria-hidden="true" />
              </div>
              <h4 className="text-xs font-semibold text-white mt-1.5 line-clamp-1">
                {preset.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                {preset.impactSummary}
              </p>
            </button>
          );
        })}
      </div>

      {/* Custom Emergency Form */}
      <form onSubmit={handleCustomTest} className="flex flex-col sm:flex-row items-center gap-2">
        <input
          type="text"
          placeholder="Emergency title (e.g. Lost metro pass)"
          aria-label="Emergency title"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          className="w-full sm:flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-400 focus-visible:ring-2 focus-visible:ring-rose-400"
        />
        <div className="w-full sm:w-40 relative">
          <span className="absolute left-3 top-2 text-xs text-slate-400 font-mono" aria-hidden="true">₹</span>
          <input
            type="number"
            placeholder="Amount"
            aria-label="Emergency amount in rupees"
            min="1"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs text-white font-mono tabular-nums placeholder-slate-400 focus:outline-none focus:border-rose-400 focus-visible:ring-2 focus-visible:ring-rose-400"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
        >
          Test Custom Shock
        </button>
      </form>

      {/* Active Emergency Shock Visualizer */}
      {isSimulating && activeAmount > 0 && (
        <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/40 space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800 font-sans">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              Emergency Shock Analysis: {activeTitle} ({formatINR(activeAmount)})
            </span>
            <span className="text-rose-400 font-mono font-semibold">Simulated Hit</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-sans">New Available Pool</span>
              <span
                className={`font-bold text-sm ${
                  newAvailable < 0 ? 'text-rose-400' : 'text-white'
                }`}
              >
                {formatINR(newAvailable)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-sans">Daily Allowance Drop</span>
              <span className="font-bold text-sm text-rose-400">
                -{formatINR(Math.round(allowanceDrop))}/day
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-sans">New Daily Allowance</span>
              <span className="font-bold text-sm text-slate-200">
                {formatINR(Math.round(newAllowance))}/day
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-sans">Days Impacted</span>
              <span className="font-bold text-sm text-slate-300">
                Next {remainingDays} days
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-400 font-sans">
              {newAvailable < 0
                ? 'Critically exceeds available budget. You must cut upcoming non-essential commitments or dip into savings goals.'
                : newAllowance >= 200
                ? 'Your budget safely absorbs this hit without breaking your month-end goal.'
                : 'Manageable, but will tighten food & travel spend for the rest of the month.'}
            </p>
            <button
              onClick={() => {
                onConfirmEmergency(activeAmount, activeTitle);
                handleReset();
              }}
              className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-rose-400 hover:bg-rose-300 rounded-lg transition-colors whitespace-nowrap font-sans"
            >
              Record as Real Expense
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
