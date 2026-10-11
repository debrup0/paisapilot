export type CategoryId =
  | 'food'
  | 'transit'
  | 'shopping'
  | 'entertainment'
  | 'subscriptions'
  | 'bills'
  | 'health'
  | 'savings'
  | 'emergency'
  | 'other';

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  iconName: string;
  color: string;
  lightBg: string;
}

export type TransactionType = 'expense' | 'savings_deposit' | 'refund';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  day: number; // 1 to 30
  category: CategoryId;
  type: TransactionType;
  notes?: string;
  isRecurring?: boolean;
  createdAt: string;
}

export interface Commitment {
  id: string;
  title: string;
  amount: number;
  dueDay: number; // 1 to 30
  category: CategoryId;
  isRecurring: boolean;
  status: 'pending' | 'paid';
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentSaved: number;
  deadlineDay: number; // 1 to 30
  category: CategoryId;
  notes?: string;
  createdAt: string;
}

export interface SimulationProposal {
  isActive: boolean;
  title: string;
  amount: number;
  category: CategoryId;
  isRecurring: boolean;
  scenarioPresetId?: string;
}

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface HealthFactor {
  name: string;
  score: number;
  maxScore: number;
  status: 'optimal' | 'warning' | 'critical';
  detail: string;
}

export interface FinancialMetrics {
  startingBudget: number;
  currentDay: number;
  remainingDays: number;
  totalSpent: number;
  totalSavingsAllocated: number;
  remainingBalance: number;
  committedUpcoming: number;
  availableToSpend: number;
  dailyAllowance: number;
  idealDailyBudget: number;
  actualDailyBurnRate: number;
  projectedMonthEndSpend: number;
  projectedMonthEndBalance: number;
  willExhaustEarly: boolean;
  exhaustionDay: number | null;
  healthScore: number;
  riskLevel: RiskLevel;
  healthFactors: HealthFactor[];
  recommendations: string[];
}

export interface SimulationComparison {
  current: FinancialMetrics;
  projected: FinancialMetrics;
  deltaAvailable: number;
  deltaDailyAllowance: number;
  deltaMonthEndBalance: number;
  deltaHealthScore: number;
  riskShift: {
    from: RiskLevel;
    to: RiskLevel;
    changed: boolean;
  };
  goalImpactSummary: string;
  feasibilityWarning?: string;
}
