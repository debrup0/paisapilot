import { Transaction, Commitment, SavingsGoal } from '../types/finance';

export const INITIAL_CURRENT_DAY = 12;

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Metro Smartcard Recharge',
    amount: 500,
    day: 1,
    category: 'transit',
    type: 'expense',
    notes: 'Monthly pass top-up for college commute',
    createdAt: '2026-10-01T09:00:00Z',
  },
  {
    id: 'tx-2',
    title: 'Blinkit Snacks & Milk essentials',
    amount: 420,
    day: 2,
    category: 'shopping',
    type: 'expense',
    notes: 'Hostel room supplies',
    createdAt: '2026-10-02T19:30:00Z',
  },
  {
    id: 'tx-3',
    title: 'Chai & Samosa college meetup',
    amount: 140,
    day: 3,
    category: 'food',
    type: 'expense',
    notes: 'Campus adda with project group',
    createdAt: '2026-10-03T16:15:00Z',
  },
  {
    id: 'tx-4',
    title: 'Spotify Student Subscription',
    amount: 59,
    day: 5,
    category: 'subscriptions',
    type: 'expense',
    notes: 'Auto-debited from UPI',
    isRecurring: true,
    createdAt: '2026-10-05T08:00:00Z',
  },
  {
    id: 'tx-5',
    title: 'Swiggy Dinner (Hyderabadi Biryani)',
    amount: 380,
    day: 6,
    category: 'food',
    type: 'expense',
    notes: 'Late night study fuel',
    createdAt: '2026-10-06T22:10:00Z',
  },
  {
    id: 'tx-6',
    title: 'PVR Movie Ticket (Weekend Show)',
    amount: 320,
    day: 8,
    category: 'entertainment',
    type: 'expense',
    notes: 'Cinema hall outing',
    createdAt: '2026-10-08T18:00:00Z',
  },
  {
    id: 'tx-7',
    title: 'Zomato Lunch with friends',
    amount: 390,
    day: 9,
    category: 'food',
    type: 'expense',
    notes: 'Burger & fries combo',
    createdAt: '2026-10-09T13:45:00Z',
  },
  {
    id: 'tx-8',
    title: 'Airtel 5G 1-Month Prepaid Plan',
    amount: 299,
    day: 11,
    category: 'bills',
    type: 'expense',
    notes: 'Mobile data recharge',
    isRecurring: true,
    createdAt: '2026-10-11T11:00:00Z',
  },
];

export const DEFAULT_COMMITMENTS: Commitment[] = [
  {
    id: 'com-1',
    title: 'Hostel Wi-Fi Split Bill',
    amount: 400,
    dueDay: 18,
    category: 'bills',
    isRecurring: true,
    status: 'pending',
    createdAt: '2026-10-01T00:00:00Z',
  },
  {
    id: 'com-2',
    title: 'Netflix Mobile Plan',
    amount: 199,
    dueDay: 24,
    category: 'subscriptions',
    isRecurring: true,
    status: 'pending',
    createdAt: '2026-10-01T00:00:00Z',
  },
];

export const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    title: 'Goa Weekend Trip Fund',
    targetAmount: 2500,
    currentSaved: 600,
    deadlineDay: 28,
    category: 'savings',
    notes: 'Train ticket & hostel advance reserve',
    createdAt: '2026-10-01T00:00:00Z',
  },
];

export interface ScenarioPreset {
  id: string;
  title: string;
  amount: number;
  category: 'food' | 'entertainment' | 'emergency' | 'shopping';
  isRecurring: boolean;
  description: string;
  badge: string;
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'preset-swiggy',
    title: 'Swiggy Midnight Pizza Feast',
    amount: 500,
    category: 'food',
    isRecurring: false,
    description: 'Craving late-night pizza & cheesy garlic bread with roommates.',
    badge: 'Food Craving',
  },
  {
    id: 'preset-concert',
    title: 'Concert Phase-1 Ticket',
    amount: 1200,
    category: 'entertainment',
    isRecurring: false,
    description: 'Early bird ticket drop for upcoming weekend music festival.',
    badge: 'Discretionary Splash',
  },
  {
    id: 'preset-repair',
    title: 'Unexpected Scooter Brake Repair',
    amount: 2000,
    category: 'emergency',
    isRecurring: false,
    description: 'Emergency mechanics bill: brake pads replacement & engine oil.',
    badge: 'Emergency Shock',
  },
  {
    id: 'preset-sneakers',
    title: 'Sneakers Flash Sale Flash Cop',
    amount: 850,
    category: 'shopping',
    isRecurring: false,
    description: 'Limited edition streetwear drop discount ending in 2 hours.',
    badge: 'Impulse Buy',
  },
];
