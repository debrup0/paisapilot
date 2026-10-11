import { CategoryId, CategoryInfo } from '../types/finance';

/**
 * Formats a numeric amount into Indian Rupee format (e.g. ₹10,000, ₹1,250).
 */
export function formatINR(
  amount: number,
  options: {
    showDecimals?: boolean;
    compact?: boolean;
    showSign?: boolean;
  } = {}
): string {
  const { showDecimals = false, compact = false, showSign = false } = options;
  
  if (isNaN(amount)) return '₹0';

  const sign = showSign && amount > 0 ? '+' : '';

  if (compact && Math.abs(amount) >= 100000) {
    const lakhs = (amount / 100000).toFixed(1);
    return `${sign}₹${lakhs}L`;
  }

  if (compact && Math.abs(amount) >= 1000) {
    const k = (amount / 1000).toFixed(1);
    return `${sign}₹${k}k`;
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  const formatted = formatter.format(amount);
  return showSign && amount > 0 ? `+${formatted}` : formatted;
}

export const CATEGORIES: Record<CategoryId, CategoryInfo> = {
  food: {
    id: 'food',
    label: 'Food & Zomato/Swiggy',
    iconName: 'Utensils',
    color: '#fb923c', // orange-400
    lightBg: 'rgba(251, 146, 60, 0.12)',
  },
  transit: {
    id: 'transit',
    label: 'Metro & Auto Commute',
    iconName: 'Navigation',
    color: '#38bdf8', // sky-400
    lightBg: 'rgba(56, 189, 248, 0.12)',
  },
  shopping: {
    id: 'shopping',
    label: 'Shopping & Quick-Comm',
    iconName: 'ShoppingBag',
    color: '#e879f9', // fuchsia-400
    lightBg: 'rgba(232, 121, 249, 0.12)',
  },
  entertainment: {
    id: 'entertainment',
    label: 'Concerts, Movies & Fun',
    iconName: 'Film',
    color: '#a78bfa', // purple-400
    lightBg: 'rgba(167, 139, 250, 0.12)',
  },
  subscriptions: {
    id: 'subscriptions',
    label: 'Subscriptions & OTT',
    iconName: 'Sparkles',
    color: '#2dd4bf', // teal-400
    lightBg: 'rgba(45, 212, 191, 0.12)',
  },
  bills: {
    id: 'bills',
    label: 'Recharge & Wi-Fi Bills',
    iconName: 'Zap',
    color: '#facc15', // yellow-400
    lightBg: 'rgba(250, 204, 21, 0.12)',
  },
  health: {
    id: 'health',
    label: 'Health & Pharmacy',
    iconName: 'HeartPulse',
    color: '#f43f5e', // rose-500
    lightBg: 'rgba(244, 63, 94, 0.12)',
  },
  savings: {
    id: 'savings',
    label: 'Savings Allocation',
    iconName: 'PiggyBank',
    color: '#4ade80', // green-400
    lightBg: 'rgba(74, 222, 128, 0.12)',
  },
  emergency: {
    id: 'emergency',
    label: 'Emergency & Urgent',
    iconName: 'AlertTriangle',
    color: '#ef4444', // red-500
    lightBg: 'rgba(239, 68, 68, 0.12)',
  },
  other: {
    id: 'other',
    label: 'Other Miscellaneous',
    iconName: 'CircleEllipsis',
    color: '#94a3b8', // slate-400
    lightBg: 'rgba(148, 163, 184, 0.12)',
  },
};
