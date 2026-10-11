/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFinanceState } from './hooks/useFinanceState';
import { formatINR } from './utils/formatters';
import { TopNavbar } from './components/TopNavbar';
import { BudgetSummaryCards } from './components/BudgetSummaryCards';
import { BudgetChart } from './components/BudgetChart';
import { DecisionSimulator } from './components/DecisionSimulator';
import { CommitmentsManager } from './components/CommitmentsManager';
import { SavingsGoalsManager } from './components/SavingsGoalsManager';
import { FinancialHealthCard } from './components/FinancialHealthCard';
import { TransactionsLedger } from './components/TransactionsLedger';
import { EmergencySimulator } from './components/EmergencySimulator';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const {
    transactions,
    commitments,
    savingsGoals,
    currentDay,
    setCurrentDay,
    simulationProposal,
    setSimulationProposal,
    metrics,
    simulationComparison,
    toastMessage,
    setToastMessage,
    handleConfirmDecision,
    handleCancelSimulation,
    handleAddTransaction,
    handleDeleteTransaction,
    handleAddCommitment,
    handleMarkCommitmentPaid,
    handleDeleteCommitment,
    handleAddGoal,
    handleDepositToGoal,
    handleWithdrawFromGoal,
    handleDeleteGoal,
    handleEmergencyConfirm,
    handleResetDemo,
  } = useFinanceState();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'simulator' | 'commitments' | 'goals' | 'ledger'
  >('overview');

  // Quick switch to simulator tab with custom preset
  const handleOpenQuickSimulate = () => {
    setActiveTab('simulator');
    setSimulationProposal({
      isActive: true,
      title: 'Weekend Outing Expense',
      amount: 500,
      category: 'food',
      isRecurring: false,
    });
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Top 3-Zone Navigation */}
      <TopNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickSimulate={handleOpenQuickSimulate}
        onResetDemo={handleResetDemo}
        currentDay={currentDay}
      />

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs text-white animate-in slide-in-from-bottom-2"
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-white ml-2 p-1 rounded focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Active Simulation Floating Banner (if simulating while on another tab) */}
        {simulationProposal.isActive && activeTab !== 'simulator' && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-semibold text-amber-300">
                Simulation Active:
              </span>
              <span className="text-slate-300">
                Testing {simulationProposal.title} ({formatINR(simulationProposal.amount)})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('simulator')}
                className="px-3 py-1 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
              >
                View Simulator
              </button>
              <button
                onClick={handleCancelSimulation}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 1. Primary Metric Cards (Available to Spend Hero, Daily Allowance, Balance, Commitments, Savings) */}
            <BudgetSummaryCards
              metrics={metrics}
              onOpenSimulator={handleOpenQuickSimulate}
              onNavigateToCommitments={() => setActiveTab('commitments')}
              onNavigateToGoals={() => setActiveTab('goals')}
            />

            {/* 2. 30-Day Spending Trajectory Interactive SVG Chart */}
            <BudgetChart
              transactions={transactions}
              metrics={metrics}
              simulationComparison={simulationProposal.isActive ? simulationComparison : null}
              onSetCurrentDay={setCurrentDay}
            />

            {/* 3. Decision Simulator Spotlight */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Instant Decision Simulator
                  </h3>
                  <p className="text-xs text-slate-400">
                    See the ripple effect of any proposed cost on your remaining ₹{formatINR(metrics.availableToSpend)}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('simulator')}
                  className="text-xs font-medium text-lime-400 hover:text-lime-300"
                >
                  Full Simulator Screen &rarr;
                </button>
              </div>

              <DecisionSimulator
                metrics={metrics}
                simulationProposal={simulationProposal}
                simulationComparison={simulationComparison}
                onUpdateProposal={setSimulationProposal}
                onConfirmDecision={handleConfirmDecision}
                onCancelSimulation={handleCancelSimulation}
              />
            </div>

            {/* 4. Financial Health Score & Month-End Forecast */}
            <FinancialHealthCard metrics={metrics} />

            {/* 5. Emergency Shock Simulator */}
            <EmergencySimulator
              metrics={metrics}
              onSimulateEmergency={setSimulationProposal}
              onConfirmEmergency={handleEmergencyConfirm}
            />

            {/* 6. Recent Transactions Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Recent Ledger Entries
                </h3>
                <button
                  onClick={() => setActiveTab('ledger')}
                  className="text-xs font-medium text-lime-400 hover:text-lime-300"
                >
                  View All ({transactions.length}) &rarr;
                </button>
              </div>
              <TransactionsLedger
                transactions={transactions}
                currentDay={currentDay}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
              />
            </div>
          </div>
        )}

        {/* TAB 2: DEDICATED SIMULATOR TAB */}
        {activeTab === 'simulator' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Financial Decision Simulator
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Explore hypothetical purchases, compare before/after metrics, and simulate risk before confirming.
              </p>
            </div>

            <DecisionSimulator
              metrics={metrics}
              simulationProposal={simulationProposal}
              simulationComparison={simulationComparison}
              onUpdateProposal={setSimulationProposal}
              onConfirmDecision={handleConfirmDecision}
              onCancelSimulation={handleCancelSimulation}
            />

            {/* Accompanying Trajectory Chart */}
            <BudgetChart
              transactions={transactions}
              metrics={metrics}
              simulationComparison={simulationProposal.isActive ? simulationComparison : null}
              onSetCurrentDay={setCurrentDay}
            />

            {/* Accompanying Emergency Shock Simulator */}
            <EmergencySimulator
              metrics={metrics}
              onSimulateEmergency={setSimulationProposal}
              onConfirmEmergency={handleEmergencyConfirm}
            />
          </div>
        )}

        {/* TAB 3: COMMITMENTS & SUBSCRIPTIONS */}
        {activeTab === 'commitments' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Commitments & Subscriptions
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Protect money for bills, Wi-Fi splits, and recurring subscriptions from daily spending.
              </p>
            </div>

            <CommitmentsManager
              commitments={commitments}
              currentDay={currentDay}
              onAddCommitment={handleAddCommitment}
              onMarkAsPaid={handleMarkCommitmentPaid}
              onDeleteCommitment={handleDeleteCommitment}
            />
          </div>
        )}

        {/* TAB 4: SAVINGS GOALS */}
        {activeTab === 'goals' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                30-Day Savings Goals
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Lock away funds for personal milestones without breaking your ₹10,000 monthly envelope.
              </p>
            </div>

            <SavingsGoalsManager
              goals={savingsGoals}
              metrics={metrics}
              onAddGoal={handleAddGoal}
              onDepositToGoal={handleDepositToGoal}
              onWithdrawFromGoal={handleWithdrawFromGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          </div>
        )}

        {/* TAB 5: TRANSACTIONS LEDGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Transactions Ledger
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Search, filter, and track all confirmed payments and debits across this 30-day budget.
              </p>
            </div>

            <TransactionsLedger
              transactions={transactions}
              currentDay={currentDay}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070b14] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">PaisaPilot</span>
            <span aria-hidden="true">·</span>
            <span>Gen Z 30-Day Financial Navigator</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span>Starting Budget: ₹10,000</span>
            <span aria-hidden="true">·</span>
            <span>Cycle: 30 Days</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
