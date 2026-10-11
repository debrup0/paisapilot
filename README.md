# PaisaPilot 💸

> **Gen Z 30-Day Budget & Financial Decision Simulator**  
> Manage a fixed ₹10,000 budget over 30 days and simulate financial decisions *before* making them.

[![Vercel Deployment](https://img.shields.io/badge/Deployed-Vercel-black?style=flat&logo=vercel)](https://paisapilot-yi8b.vercel.app)
[![React 19](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Vite 6](https://img.shields.io/badge/Vite-6-646cff?style=flat&logo=vite)](https://vitejs.dev/)

---

## 🌐 Live Demo & Repository

- **Live Application:** [https://paisapilot-yi8b.vercel.app](https://paisapilot-yi8b.vercel.app)
- **Source Code:** [https://github.com/debrup0/paisapilot](https://github.com/debrup0/paisapilot)

---

## 🎯 Mission & Product Concept

Young adults and college students in India often struggle with monthly pocket money or stipend exhaustion, running out of funds before the month ends. Traditional budgeting apps act merely as passive post-mortem loggers: they tell you that you overspent *after* the money is already gone.

**PaisaPilot** inverts this paradigm into an **interactive decision simulator**:
- Enforces an active **₹10,000 monthly envelope** over **30 days**.
- Lets users stress-test discretionary purchases, concert tickets, midnight deliveries, or unplanned emergencies before spending a single rupee.
- Provides immediate mathematical visibility into the ripple effect on daily allowances, month-end projections, and savings goals.

---

## ✨ Core Features

### 1. Unified 5-Pool Budget Model
PaisaPilot separates funds into distinct, mathematically consistent pools without double-counting:
- **Available to Spend (Liquid Pool):** `Remaining Balance − Pending Commitments − Savings Reserved`.
- **Daily Allowance:** `Available to Spend ÷ Remaining Days` (benchmarked against the ideal ₹333.33/day baseline).
- **Remaining Overall Balance:** `Starting Budget (₹10,000) − Total Confirmed Expenses`.
- **Committed Upcoming Dues:** Ring-fenced liabilities (Wi-Fi, subscriptions, rent splits) deducted from spendable cash.
- **Savings Goal Reserves:** Locked deposits for travel, gadgets, or emergency cushions.

### 2. Financial Decision Simulator (Sandbox Mode)
- **Real-Time Side-by-Side Diff:** Compares current financial reality with projected metrics before confirmation.
- **Impact Indicators:** Shows instant deltas on spendable pool, daily burn rate, health score, and risk rating.
- **Quick Scenarios:** Preloaded test cases (₹500 Swiggy feast, ₹1,200 concert ticket, ₹2,000 emergency repair, ₹850 flash sale).
- **Explicit Confirmation:** Sandboxed simulations do not alter live state until explicitly confirmed with **Confirm Decision**.

### 3. Interactive 30-Day Spending Trajectory Chart
- Custom SVG visualization showing Day 1 through 30.
- **4 Visual Trajectories:**
  1. *Ideal Linear Pace* (dashed baseline: ₹333.33/day).
  2. *Actual Spent* (smooth gradient curve up to current day).
  3. *Projected Trajectory* (extrapolation to Day 30 based on burn rate).
  4. *Simulated Trajectory* (shows hypothetical jump and month-end landing point).
- Keyboard accessible day hitboxes (`Tab`, `Enter`, `Space`) with crosshairs and variance feedback.

### 4. Commitments & Subscriptions Manager
- Track recurring dues with custom due days (1–30) and categories.
- **Zero Double-Counting:** Deducts from available daily allowance without prematurely recording expenses in overall balance.
- **Mark as Paid Flow:** Seamlessly shifts pending liabilities into confirmed transaction history.

### 5. 30-Day Micro Savings Goals
- Set short-term financial targets (e.g. Goa Trip Fund, Wireless Earbuds) with deadlines.
- Interactive **Deposit** and **Withdraw** actions that safely transfer liquidity to and from goal reserves.
- Feasibility engine warns if goals become compromised by discretionary spending.

### 6. Emergency & Shock Simulator
- Stress-test sudden shocks (cracked phone screen, doctor visit, surge bills).
- Demonstrates how sudden shocks compress daily allowances across remaining days.

### 7. Financial Health & Risk Index (0–100)
Transparent, deterministic scoring model:
- **Spending Pace & Burn Rate (40 pts):** Measures burn rate vs ideal linear benchmark.
- **Daily Allowance Cushion (25 pts):** Evaluates spendable buffer for remaining days.
- **Commitment Coverage (20 pts):** Validates liability coverage ratios.
- **Savings Feasibility (15 pts):** Analyzes goal completion gap.
- **Risk Tiers:** Low Risk ($\ge 75$), Moderate Risk ($50–74$), High Risk ($< 50$).
- Actionable, non-judgmental guidance tailored to Gen Z lifestyles.

### 8. Transactions Ledger
- Full history with unboxed, high-contrast metadata.
- Instant search and dual filtering by Category and Type (Debit, Refund, Savings Deposit).
- LocalStorage persistence with an instant **Reset Demo** fallback.

---

## 🏗️ Code Architecture

The application is structured with a clear separation of concerns:

```
paisapilot/
├── src/
│   ├── components/                # Modular UI presentation components
│   │   ├── TopNavbar.tsx          # 3-zone semantic navigation with 44px mobile touch targets
│   │   ├── BudgetSummaryCards.tsx # 5 primary metric cards with accessible button triggers
│   │   ├── BudgetChart.tsx        # Interactive 30-day SVG trajectory visualizer
│   │   ├── DecisionSimulator.tsx  # Side-by-side proposal sandbox & comparison
│   │   ├── CommitmentsManager.tsx # Upcoming liabilities & bill settlement
│   │   ├── SavingsGoalsManager.tsx# Goal tracker & transfer modal
│   │   ├── FinancialHealthCard.tsx# 0-100 score engine & factor progressbars
│   │   ├── TransactionsLedger.tsx # Filterable & searchable transaction list
│   │   └── EmergencySimulator.tsx # Sudden shock stress-testing
│   ├── hooks/
│   │   └── useFinanceState.ts     # Centralized reactive state, persistence & action handlers
│   ├── types/
│   │   └── finance.ts             # Domain models, category enums, and calculation contracts
│   ├── utils/
│   │   ├── calculations.ts        # Pure, deterministic mathematical calculation engine
│   │   ├── demoData.ts            # Realistic Gen Z India seed data & scenario presets
│   │   └── formatters.ts          # INR currency formatting (Lakh/k separators) & metadata
│   ├── App.tsx                    # Main orchestration view & tab routing
│   ├── index.css                  # Tailwind CSS v4 layers & prefers-reduced-motion
│   └── main.tsx                   # React 19 entry point
├── package.json                   # Dependency definitions
├── tsconfig.json                  # Strict TypeScript configuration
└── vite.config.ts                 # Vite 6 config with vendor chunk code splitting
```

### Architectural Highlights

- **Custom State Hook (`useFinanceState`):** Separates application data management, localStorage persistence, and handlers from UI presentation components.
- **Pure Calculation Engine (`calculations.ts`):** 100% testable, zero-side-effect financial algorithms that power both real metrics and simulated projections.
- **Granular Memoization:** `metrics`, `simulationComparison`, `chartPaths`, and `filteredTransactions` are wrapped in `useMemo` to eliminate unnecessary re-renders.

---

## ⚡ Performance & Accessibility Engineering

- **Code Splitting & Chunk Optimization:** Configured `manualChunks` in `vite.config.ts` to isolate `vendor-react` (~430 kB) and `vendor-icons` (~12 kB), reducing the application bundle down to **178 kB** (27 kB gzipped).
- **Keyboard Navigation:** Every interactive element, including SVG chart day columns, modal dialogs, and stat cards, is fully navigable via `Tab`, `Enter`, and `Space`.
- **WCAG AA Contrast Compliance:** Tested and upgraded muted text, captions, and denominator labels to maintain $\ge 4.5:1$ contrast against the `#070b14` dark navy canvas.
- **Mobile Touch Targets:** Enforced $\ge 44\text{px}$ touch targets on navigation items, filters, and modal controls per WCAG 2.5.5 / 2.5.8.
- **Accessible ARIA Semantics:** Integrated `role="dialog"`, `role="progressbar"`, `role="status"`, and descriptive `aria-label`s across icon-only buttons.
- **Reduced Motion Support:** Includes `@media (prefers-reduced-motion: reduce)` rules for users with vestibular sensitivities.

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `^19.0.1` | Core UI library & functional components |
| **TypeScript** | `^7.0.2` | Static type safety and domain models |
| **Vite** | `^6.2.0` | Build tool, dev server, and production bundler |
| **Tailwind CSS** | `^4.0.0` | Utility-first styling with dark navy aesthetic |
| **@tailwindcss/vite** | `^4.0.0` | Official Tailwind CSS v4 Vite compiler plugin |
| **@vitejs/plugin-react**| `^4.3.4` | Fast Refresh and JSX transformation |
| **Lucide React** | `^0.546.0` | Accessible iconography |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `18.x` or higher
- npm `9.x` or higher

### Installation & Development

```bash
# 1. Clone repository
git clone https://github.com/debrup0/paisapilot.git
cd paisapilot

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open http://localhost:3000 in your browser
```

### Production Build & Verification

```bash
# Run strict TypeScript type check
npm run lint

# Compile optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📄 License & Attribution

Built for the Google AI Studio Frontend Arena evaluation. Licensed under the Apache-2.0 License.
