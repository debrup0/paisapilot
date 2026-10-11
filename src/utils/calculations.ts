import {
  Transaction,
  Commitment,
  SavingsGoal,
  FinancialMetrics,
  HealthFactor,
  RiskLevel,
  SimulationProposal,
  SimulationComparison,
} from '../types/finance';

export const STARTING_BUDGET = 10000;
export const TOTAL_DAYS = 30;

/**
 * Deterministically calculates all core financial metrics from current state.
 */
export function calculateFinancialMetrics(
  transactions: Transaction[],
  commitments: Commitment[],
  savingsGoals: SavingsGoal[],
  currentDay: number = 12,
  startingBudget: number = STARTING_BUDGET
): FinancialMetrics {
  const boundedDay = Math.min(Math.max(1, currentDay), TOTAL_DAYS);
  const remainingDays = Math.max(1, TOTAL_DAYS - boundedDay + 1);

  // 1. Total spent: Confirmed expenses minus refunds
  const totalSpent = transactions.reduce((acc, tx) => {
    if (tx.type === 'expense') {
      return acc + tx.amount;
    } else if (tx.type === 'refund') {
      return acc - tx.amount;
    }
    return acc;
  }, 0);

  // 2. Savings allocated
  const totalSavingsAllocated = savingsGoals.reduce(
    (acc, goal) => acc + Math.max(0, goal.currentSaved),
    0
  );

  // 3. Remaining overall balance
  const remainingBalance = startingBudget - totalSpent;

  // 4. Committed upcoming expenses (only pending ones)
  const committedUpcoming = commitments.reduce((acc, c) => {
    if (c.status === 'pending') {
      return acc + c.amount;
    }
    return acc;
  }, 0);

  // 5. Available to spend: Money free after reserving commitments & savings
  const availableToSpend = remainingBalance - committedUpcoming - totalSavingsAllocated;

  // 6. Daily allowance for remaining days
  const dailyAllowance = Math.max(0, availableToSpend) / remainingDays;
  const idealDailyBudget = startingBudget / TOTAL_DAYS; // ₹333.33

  // 7. Spending pace & forecast
  const daysElapsed = Math.max(1, boundedDay);
  const actualDailyBurnRate = totalSpent / daysElapsed;

  // Forecast month-end spend:
  // spent so far + projected spend for days remaining + upcoming commitments
  const daysLeftToSpend = Math.max(0, TOTAL_DAYS - boundedDay);
  const projectedFutureDiscretionary = actualDailyBurnRate * daysLeftToSpend;
  const projectedMonthEndSpend = Math.round(
    totalSpent + projectedFutureDiscretionary + committedUpcoming
  );
  const projectedMonthEndBalance = Math.round(startingBudget - projectedMonthEndSpend);

  // Early exhaustion calculation
  let willExhaustEarly = false;
  let exhaustionDay: number | null = null;

  if (actualDailyBurnRate > 0) {
    const uncommittedPool = startingBudget - committedUpcoming;
    const daysUntilExhaustion = uncommittedPool / actualDailyBurnRate;
    if (daysUntilExhaustion < TOTAL_DAYS) {
      willExhaustEarly = true;
      exhaustionDay = Math.min(30, Math.max(1, Math.floor(daysUntilExhaustion)));
    }
  }

  // 8. Financial Health Score (0-100) & Transparent Factors
  // Factor 1: Pace & Burn Rate (Max 40 pts)
  let burnScore = 0;
  let burnDetail = '';
  let burnStatus: 'optimal' | 'warning' | 'critical' = 'optimal';

  if (actualDailyBurnRate <= idealDailyBudget * 1.05) {
    burnScore = 40;
    burnDetail = `Daily burn rate (${Math.round(actualDailyBurnRate)}/day) is well within target (${Math.round(idealDailyBudget)}/day).`;
    burnStatus = 'optimal';
  } else if (actualDailyBurnRate <= idealDailyBudget * 1.35) {
    const ratio = idealDailyBudget / actualDailyBurnRate;
    burnScore = Math.max(20, Math.round(40 * ratio));
    burnDetail = `Spending is ${(Math.round((actualDailyBurnRate / idealDailyBudget - 1) * 100))}% faster than the ideal pace.`;
    burnStatus = 'warning';
  } else {
    const ratio = Math.max(0.1, idealDailyBudget / actualDailyBurnRate);
    burnScore = Math.max(5, Math.round(30 * ratio));
    burnDetail = `High burn rate (${Math.round(actualDailyBurnRate)}/day) threatens budget depletion.`;
    burnStatus = 'critical';
  }

  // Factor 2: Daily Allowance Comfort (Max 25 pts)
  let allowanceScore = 0;
  let allowanceDetail = '';
  let allowanceStatus: 'optimal' | 'warning' | 'critical' = 'optimal';

  if (dailyAllowance >= 300) {
    allowanceScore = 25;
    allowanceDetail = `₹${Math.round(dailyAllowance)}/day remaining allows comfortable daily flexibility.`;
    allowanceStatus = 'optimal';
  } else if (dailyAllowance >= 180) {
    allowanceScore = Math.round(15 + ((dailyAllowance - 180) / 120) * 10);
    allowanceDetail = `₹${Math.round(dailyAllowance)}/day remaining requires mindful spending.`;
    allowanceStatus = 'warning';
  } else {
    allowanceScore = Math.max(0, Math.round((dailyAllowance / 180) * 14));
    allowanceDetail = `₹${Math.round(dailyAllowance)}/day is tight; limit discretionary dining and outings.`;
    allowanceStatus = 'critical';
  }

  // Factor 3: Committed Liability Cushion (Max 20 pts)
  let liabilityScore = 0;
  let liabilityDetail = '';
  let liabilityStatus: 'optimal' | 'warning' | 'critical' = 'optimal';

  if (committedUpcoming === 0) {
    liabilityScore = 20;
    liabilityDetail = 'Zero pending commitments or subscriptions for this month.';
    liabilityStatus = 'optimal';
  } else {
    const coverageRatio = remainingBalance / committedUpcoming;
    if (coverageRatio >= 2.5) {
      liabilityScore = 20;
      liabilityDetail = `Pending commitments (₹${committedUpcoming}) are safe with ${(coverageRatio).toFixed(1)}x coverage.`;
      liabilityStatus = 'optimal';
    } else if (coverageRatio >= 1.0) {
      liabilityScore = Math.round(10 + (coverageRatio - 1) * 6.5);
      liabilityDetail = `Pending bills (₹${committedUpcoming}) are covered, but cushion is limited.`;
      liabilityStatus = 'warning';
    } else {
      liabilityScore = 0;
      liabilityDetail = `Remaining balance does not cover pending bills (₹${committedUpcoming}).`;
      liabilityStatus = 'critical';
    }
  }

  // Factor 4: Savings Feasibility & Cushion (Max 15 pts)
  let savingsScore = 0;
  let savingsDetail = '';
  let savingsStatus: 'optimal' | 'warning' | 'critical' = 'optimal';

  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  if (totalTarget === 0) {
    savingsScore = 15;
    savingsDetail = 'No active savings goals defined.';
    savingsStatus = 'optimal';
  } else {
    const totalRemainingGoalGap = Math.max(0, totalTarget - totalSavingsAllocated);
    if (availableToSpend >= totalRemainingGoalGap && availableToSpend > 0) {
      savingsScore = 15;
      savingsDetail = 'Savings goals fully achievable with current available budget.';
      savingsStatus = 'optimal';
    } else if (availableToSpend >= totalRemainingGoalGap * 0.5) {
      savingsScore = 10;
      savingsDetail = 'Savings goals partially cushioned; avoid impulsive purchases.';
      savingsStatus = 'warning';
    } else {
      savingsScore = Math.max(2, Math.round((availableToSpend / (totalRemainingGoalGap || 1)) * 10));
      savingsDetail = 'Savings target at risk if discretionary expenses are not controlled.';
      savingsStatus = 'critical';
    }
  }

  const rawTotalScore = burnScore + allowanceScore + liabilityScore + savingsScore;
  const healthScore = Math.min(100, Math.max(0, rawTotalScore));

  let riskLevel: RiskLevel = 'low';
  if (healthScore >= 75) {
    riskLevel = 'low';
  } else if (healthScore >= 50) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'high';
  }

  const healthFactors: HealthFactor[] = [
    {
      name: 'Spending Pace & Burn Rate',
      score: burnScore,
      maxScore: 40,
      status: burnStatus,
      detail: burnDetail,
    },
    {
      name: 'Daily Allowance Buffer',
      score: allowanceScore,
      maxScore: 25,
      status: allowanceStatus,
      detail: allowanceDetail,
    },
    {
      name: 'Commitment Coverage',
      score: liabilityScore,
      maxScore: 20,
      status: liabilityStatus,
      detail: liabilityDetail,
    },
    {
      name: 'Savings Goal Feasibility',
      score: savingsScore,
      maxScore: 15,
      status: savingsStatus,
      detail: savingsDetail,
    },
  ];

  // Actionable recommendations tailored for Gen Z
  const recommendations: string[] = [];
  if (dailyAllowance < 250) {
    recommendations.push(
      `Cap non-essential food deliveries (Swiggy/Zomato) to 1 order this week to keep allowance above ₹250/day.`
    );
  }
  if (actualDailyBurnRate > idealDailyBudget) {
    const diff = Math.round(actualDailyBurnRate - idealDailyBudget);
    recommendations.push(
      `You are pacing ₹${diff}/day above target. Slow down for 3 days to bring overall pace back to baseline.`
    );
  }
  if (committedUpcoming > 0 && availableToSpend < committedUpcoming) {
    recommendations.push(
      `Pending commitments (₹${committedUpcoming}) need protection. Hold off on shopping until bills clear.`
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      'Your spending rhythm is on point. You have room for comfortable day-to-day living while keeping your goals protected.'
    );
  }

  return {
    startingBudget,
    currentDay: boundedDay,
    remainingDays,
    totalSpent,
    totalSavingsAllocated,
    remainingBalance,
    committedUpcoming,
    availableToSpend,
    dailyAllowance,
    idealDailyBudget,
    actualDailyBurnRate,
    projectedMonthEndSpend,
    projectedMonthEndBalance,
    willExhaustEarly,
    exhaustionDay,
    healthScore,
    riskLevel,
    healthFactors,
    recommendations,
  };
}

/**
 * Simulates the exact impact of a proposed expense against current financial reality.
 */
export function simulateDecision(
  currentMetrics: FinancialMetrics,
  transactions: Transaction[],
  commitments: Commitment[],
  savingsGoals: SavingsGoal[],
  proposal: SimulationProposal
): SimulationComparison {
  if (!proposal.isActive || proposal.amount <= 0) {
    return {
      current: currentMetrics,
      projected: currentMetrics,
      deltaAvailable: 0,
      deltaDailyAllowance: 0,
      deltaMonthEndBalance: 0,
      deltaHealthScore: 0,
      riskShift: {
        from: currentMetrics.riskLevel,
        to: currentMetrics.riskLevel,
        changed: false,
      },
      goalImpactSummary: 'No active simulation.',
    };
  }

  // Create virtual transaction
  const virtualTx: Transaction = {
    id: 'virtual-simulated',
    title: proposal.title || 'Simulated Expense',
    amount: proposal.amount,
    day: currentMetrics.currentDay,
    category: proposal.category,
    type: 'expense',
    createdAt: new Date().toISOString(),
  };

  const projectedTransactions = [...transactions, virtualTx];

  // If recurring, could also affect upcoming commitments if marked as commitment
  const projectedMetrics = calculateFinancialMetrics(
    projectedTransactions,
    commitments,
    savingsGoals,
    currentMetrics.currentDay,
    currentMetrics.startingBudget
  );

  const deltaAvailable = projectedMetrics.availableToSpend - currentMetrics.availableToSpend;
  const deltaDailyAllowance =
    projectedMetrics.dailyAllowance - currentMetrics.dailyAllowance;
  const deltaMonthEndBalance =
    projectedMetrics.projectedMonthEndBalance - currentMetrics.projectedMonthEndBalance;
  const deltaHealthScore = projectedMetrics.healthScore - currentMetrics.healthScore;

  const riskChanged = currentMetrics.riskLevel !== projectedMetrics.riskLevel;

  // Evaluate savings impact
  const topGoal = savingsGoals[0];
  let goalImpactSummary = 'Your goals remain unimpacted.';
  if (topGoal) {
    const unallocatedAfter = projectedMetrics.availableToSpend;
    const needed = topGoal.targetAmount - topGoal.currentSaved;
    if (unallocatedAfter < 0) {
      goalImpactSummary = `Warning: This expense puts your budget into a deficit of ₹${Math.abs(unallocatedAfter)}, risking your "${topGoal.title}".`;
    } else if (unallocatedAfter < needed) {
      goalImpactSummary = `This purchase reduces your free buffer below what is needed for "${topGoal.title}" (₹${needed} required, ₹${unallocatedAfter} available).`;
    } else {
      const bufferPct = Math.round((proposal.amount / (currentMetrics.availableToSpend || 1)) * 100);
      goalImpactSummary = `"${topGoal.title}" remains on track, but this expense consumes ${bufferPct}% of your remaining free money.`;
    }
  }

  let feasibilityWarning: string | undefined;
  if (projectedMetrics.availableToSpend < 0) {
    feasibilityWarning = `Overspending alert! This decision exceeds your available money by ₹${Math.abs(projectedMetrics.availableToSpend)}.`;
  } else if (projectedMetrics.dailyAllowance < 150) {
    feasibilityWarning = `Tight allowance alert: Your daily spending room shrinks to just ₹${Math.round(projectedMetrics.dailyAllowance)}/day for the remaining ${projectedMetrics.remainingDays} days.`;
  }

  return {
    current: currentMetrics,
    projected: projectedMetrics,
    deltaAvailable,
    deltaDailyAllowance,
    deltaMonthEndBalance,
    deltaHealthScore,
    riskShift: {
      from: currentMetrics.riskLevel,
      to: projectedMetrics.riskLevel,
      changed: riskChanged,
    },
    goalImpactSummary,
    feasibilityWarning,
  };
}
