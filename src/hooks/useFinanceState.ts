import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Transaction,
  Commitment,
  SavingsGoal,
  SimulationProposal,
} from '../types/finance';
import {
  DEFAULT_TRANSACTIONS,
  DEFAULT_COMMITMENTS,
  DEFAULT_SAVINGS_GOALS,
  INITIAL_CURRENT_DAY,
} from '../utils/demoData';
import {
  calculateFinancialMetrics,
  simulateDecision,
  STARTING_BUDGET,
} from '../utils/calculations';
import { formatINR } from '../utils/formatters';

const STORAGE_KEY_TX = 'paisapilot_transactions_v1';
const STORAGE_KEY_COM = 'paisapilot_commitments_v1';
const STORAGE_KEY_GOALS = 'paisapilot_goals_v1';
const STORAGE_KEY_DAY = 'paisapilot_day_v1';

export interface ToastMessage {
  type: 'success' | 'info';
  text: string;
}

/**
 * Custom hook encapsulating reactive financial state, persistence,
 * memoized calculations, and decision simulation workflows.
 */
export function useFinanceState() {
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

  // Active Simulation Proposal state
  const [simulationProposal, setSimulationProposal] = useState<SimulationProposal>({
    isActive: false,
    title: '',
    amount: 0,
    category: 'food',
    isRecurring: false,
  });

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COM, JSON.stringify(commitments));
    } catch (e) {
      console.error('Failed to save commitments to localStorage', e);
    }
  }, [commitments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(savingsGoals));
    } catch (e) {
      console.error('Failed to save savings goals to localStorage', e);
    }
  }, [savingsGoals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DAY, currentDay.toString());
    } catch (e) {
      console.error('Failed to save currentDay to localStorage', e);
    }
  }, [currentDay]);

  // Auto-dismiss toast after 4s
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Pure financial calculations memoized to avoid recomputing on unrelated re-renders
  const metrics = useMemo(
    () =>
      calculateFinancialMetrics(
        transactions,
        commitments,
        savingsGoals,
        currentDay,
        STARTING_BUDGET
      ),
    [transactions, commitments, savingsGoals, currentDay]
  );

  const simulationComparison = useMemo(
    () =>
      simulateDecision(
        metrics,
        transactions,
        commitments,
        savingsGoals,
        simulationProposal
      ),
    [metrics, transactions, commitments, savingsGoals, simulationProposal]
  );

  // Handler: Confirm simulated decision
  const handleConfirmDecision = useCallback(() => {
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
  }, [simulationProposal, currentDay]);

  // Handler: Cancel simulation
  const handleCancelSimulation = useCallback(() => {
    setSimulationProposal({
      isActive: false,
      title: '',
      amount: 0,
      category: 'food',
      isRecurring: false,
    });
  }, []);

  // Handler: Add transaction
  const handleAddTransaction = useCallback(
    (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
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
    },
    []
  );

  // Handler: Delete transaction
  const handleDeleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setToastMessage({
      type: 'info',
      text: 'Transaction removed.',
    });
  }, []);

  // Handler: Add commitment
  const handleAddCommitment = useCallback(
    (com: Omit<Commitment, 'id' | 'createdAt'>) => {
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
    },
    []
  );

  // Handler: Mark commitment as paid
  const handleMarkCommitmentPaid = useCallback(
    (id: string) => {
      const commitment = commitments.find((c) => c.id === id);
      if (!commitment) return;

      setCommitments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'paid' } : c))
      );

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
    },
    [commitments, currentDay]
  );

  // Handler: Delete commitment
  const handleDeleteCommitment = useCallback((id: string) => {
    setCommitments((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Handler: Add savings goal
  const handleAddGoal = useCallback(
    (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
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
    },
    []
  );

  // Handler: Deposit funds to goal
  const handleDepositToGoal = useCallback((goalId: string, amount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentSaved: g.currentSaved + amount } : g
      )
    );
    setToastMessage({
      type: 'success',
      text: `Added ${formatINR(amount)} into goal reserve.`,
    });
  }, []);

  // Handler: Withdraw from goal
  const handleWithdrawFromGoal = useCallback((goalId: string, amount: number) => {
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
  }, []);

  // Handler: Delete goal
  const handleDeleteGoal = useCallback((goalId: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== goalId));
  }, []);

  // Handler: Emergency shock confirmed as expense
  const handleEmergencyConfirm = useCallback(
    (amount: number, title: string) => {
      const emergencyTx: Transaction = {
        id: `tx-emergency-${Date.now()}`,
        title: title || 'Emergency Expense',
        amount,
        day: currentDay,
        category: 'emergency',
        type: 'expense',
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [emergencyTx, ...prev]);
      setToastMessage({
        type: 'success',
        text: `Recorded emergency cost of ${formatINR(amount)}.`,
      });
    },
    [currentDay]
  );

  // Handler: Reset demo data
  const handleResetDemo = useCallback(() => {
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
      text: 'Demo data reset to Day 12 baseline.',
    });
  }, []);

  return {
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
  };
}
