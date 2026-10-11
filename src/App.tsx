/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Transaction,
  Commitment,
  SavingsGoal,
  SimulationProposal,
  CategoryId,
} from './types/finance';
import {
  DEFAULT_TRANSACTIONS,
  DEFAULT_COMMITMENTS,
  DEFAULT_SAVINGS_GOALS,
  INITIAL_CURRENT_DAY,
} from './utils/demoData';
import { calculateFinancialMetrics, simulateDecision, STARTING_BUDGET } from './utils/calculations';
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

const STORAGE_KEY_TX = 'paisapilot_transactions_v1';
const STORAGE_KEY_COM = 'paisapilot_commitments_v1';
const STORAGE_KEY_GOALS = 'paisapilot_goals_v1';
const STORAGE_KEY_DAY = 'paisapilot_day_v1';

export default function App() {
  // Load state from localStorage or fallback to realistic demo data
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TX);
      return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
    } catch {
      return DEFAULT_TRANSACTIONS;
    }
  });

  const [commitments, setCommitments] = useState<Commitment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COM);
      return saved ? JSON.parse(saved) : DEFAULT_COMMITMENTS;
    } catch {
      return DEFAULT_COMMITMENTS;
    }
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GOALS);
      return saved ? JSON.parse(saved) : DEFAULT_SAVINGS_GOALS;
    } catch {
      return DEFAULT_SAVINGS_GOALS;
    }
  });

  const [currentDay, setCurrentDay] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DAY);
      return saved ? parseInt(saved, 10) : INITIAL_CURRENT_DAY;
    } catch {
      return INITIAL_CURRENT_DAY;
    }
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'simulator' | 'commitments' | 'goals' | 'ledger'
  >('overview');

  // Simulation Proposal state
  const [simulationProposal, setSimulationProposal] = useState<SimulationProposal>({
    isActive: false,
    title: '',
    amount: 0,
    category: 'food',
    isRecurring: false,
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'info';
    text: string;
  } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COM, JSON.stringify(commitments));
    } catch (e) {
      console.error(e);
    }
  }, [commitments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(savingsGoals));
    } catch (e) {
      console.error(e);
    }
  }, [savingsGoals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DAY, currentDay.toString());
    } catch (e) {
      console.error(e);
    }
  }, [currentDay]);

  // Pure financial calculations
  const metrics = calculateFinancialMetrics(
    transactions,
    commitments,
    savingsGoals,
    currentDay,
    STARTING_BUDGET
  );

  const simulationComparison = simulateDecision(
    metrics,
    transactions,
    commitments,
    savingsGoals,
    simulationProposal
  );

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handler: Confirm decision from simulator
  const handleConfirmDecision = () => {
    if (!simulationProposal.isActive || simulationProposal.amount <= 0) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: simulationProposal.title || 'Simulated Expense',
      amount: simulationProposal.amount,
      day: currentDay,
      category: simulationProposal.category,
      type: 'expense',
      isRecurring: simulationProposal.isRecurring,
      notes: simulationProposal.isRecurring ? 'Recurring monthly decision' : undefined,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // If marked recurring, add to upcoming commitments for the following cycle
    if (simulationProposal.isRecurring) {
      const newCom: Commitment = {
        id: `com-${Date.now()}`,
        title: simulationProposal.title,
        amount: simulationProposal.amount,
        dueDay: Math.min(30, currentDay + 1),
        category: simulationProposal.category,
        isRecurring: true,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setCommitments((prev) => [...prev, newCom]);
    }

    setToastMessage({
      type: 'success',
      text: `Decision confirmed! Deducted ${formatINR(simulationProposal.amount)} from available budget.`,
    });

    // Reset simulation
    setSimulationProposal({
      isActive: false,
      title: '',
      amount: 0,
      category: 'food',
      isRecurring: false,
    });
  };

  // Handler: Cancel simulation
  const handleCancelSimulation = () => {
    setSimulationProposal({
      isActive: false,
      title: '',
      amount: 0,
      category: 'food',
      isRecurring: false,
    });
  };

  // Handler: Add transaction
  const handleAddTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    setToastMessage({
      type: 'success',
      text: `Recorded ${newTx.title} (${formatINR(newTx.amount)}).`,
    });
  };

  // Handler: Delete transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setToastMessage({
      type: 'info',
      text: 'Transaction removed.',
    });
  };

  // Handler: Add commitment
  const handleAddCommitment = (com: Omit<Commitment, 'id' | 'createdAt'>) => {
    const newCom: Commitment = {
      ...com,
      id: `com-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCommitments((prev) => [...prev, newCom]);
    setToastMessage({
      type: 'success',
      text: `Added ${newCom.title} (${formatINR(newCom.amount)}) to commitments.`,
    });
  };

  // Handler: Mark commitment as paid
  const handleMarkCommitmentPaid = (id: string) => {
    const commitment = commitments.find((c) => c.id === id);
    if (!commitment) return;

    // Shift commitment to paid
    setCommitments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'paid' } : c))
    );

    // Create confirmed transaction on today
    const paidTx: Transaction = {
      id: `tx-paid-${Date.now()}`,
      title: `${commitment.title} (Settled Bill)`,
      amount: commitment.amount,
      day: currentDay,
      category: commitment.category,
      type: 'expense',
      isRecurring: commitment.isRecurring,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [paidTx, ...prev]);

    setToastMessage({
      type: 'success',
      text: `Marked "${commitment.title}" as paid! Converted into confirmed transaction.`,
    });
  };

  // Handler: Delete commitment
  const handleDeleteCommitment = (id: string) => {
    setCommitments((prev) => prev.filter((c) => c.id !== id));
  };

  // Handler: Add savings goal
  const handleAddGoal = (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
    setToastMessage({
      type: 'success',
      text: `Created savings goal "${newGoal.title}"!`,
    });
  };

  // Handler: Deposit funds to goal
  const handleDepositToGoal = (goalId: string, amount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentSaved: g.currentSaved + amount } : g
      )
    );
    setToastMessage({
      type: 'success',
      text: `Added ${formatINR(amount)} into goal reserve.`,
    });
  };

  // Handler: Withdraw from goal
  const handleWithdrawFromGoal = (goalId: string, amount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, currentSaved: Math.max(0, g.currentSaved - amount) }
          : g
      )
    );
    setToastMessage({
      type: 'info',
      text: `Returned ${formatINR(amount)} to available budget.`,
    });
  };

  // Handler: Delete goal
  const handleDeleteGoal = (goalId: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  // Handler: Reset demo data
  const handleResetDemo = () => {
    localStorage.removeItem(STORAGE_KEY_TX);
    localStorage.removeItem(STORAGE_KEY_COM);
    localStorage.removeItem(STORAGE_KEY_GOALS);
    localStorage.removeItem(STORAGE_KEY_DAY);
    setTransactions(DEFAULT_TRANSACTIONS);
    setCommitments(DEFAULT_COMMITMENTS);
    setSavingsGoals(DEFAULT_SAVINGS_GOALS);
    setCurrentDay(INITIAL_CURRENT_DAY);
    setSimulationProposal({
      isActive: false,
      title: '',
      amount: 0,
      category: 'food',
      isRecurring: false,
    });
    setToastMessage({
      type: 'info',
      text: 'Demo data reset to Day 12 starting state.',
    });
  };

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
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs text-white animate-in slide-in-from-bottom-2">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-sky-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
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
              onConfirmEmergency={(amt, title) => {
                const emergencyTx: Transaction = {
                  id: `tx-emergency-${Date.now()}`,
                  title: title || 'Emergency Expense',
                  amount: amt,
                  day: currentDay,
                  category: 'emergency',
                  type: 'expense',
                  createdAt: new Date().toISOString(),
                };
                setTransactions((prev) => [emergencyTx, ...prev]);
                setToastMessage({
                  type: 'success',
                  text: `Recorded emergency cost of ${formatINR(amt)}.`,
                });
              }}
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
              onConfirmEmergency={(amt, title) => {
                const emergencyTx: Transaction = {
                  id: `tx-emergency-${Date.now()}`,
                  title: title || 'Emergency Expense',
                  amount: amt,
                  day: currentDay,
                  category: 'emergency',
                  type: 'expense',
                  createdAt: new Date().toISOString(),
                };
                setTransactions((prev) => [emergencyTx, ...prev]);
                setToastMessage({
                  type: 'success',
                  text: `Recorded emergency expense of ${formatINR(amt)}.`,
                });
              }}
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
