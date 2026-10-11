import React from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';

interface TopNavbarProps {
  activeTab: 'overview' | 'simulator' | 'commitments' | 'goals' | 'ledger';
  setActiveTab: (tab: 'overview' | 'simulator' | 'commitments' | 'goals' | 'ledger') => void;
  onOpenQuickSimulate: () => void;
  onResetDemo: () => void;
  currentDay: number;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickSimulate,
  onResetDemo,
  currentDay,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#070b14]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button
            onClick={() => setActiveTab('overview')}
            aria-label={`PaisaPilot Dashboard, Day ${currentDay} of 30`}
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity rounded-lg focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
          >
            <span>Paisa<span className="text-lime-400">Pilot</span></span>
            <span className="text-xs font-mono text-slate-400 font-normal">Day {currentDay}/30</span>
          </button>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              aria-current={activeTab === 'overview' ? 'page' : undefined}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 rounded focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none ${
                activeTab === 'overview'
                  ? 'text-lime-400 font-semibold border-b-2 border-lime-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              aria-current={activeTab === 'simulator' ? 'page' : undefined}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 rounded focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none ${
                activeTab === 'simulator'
                  ? 'text-lime-400 font-semibold border-b-2 border-lime-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Decision Simulator
            </button>
            <button
              onClick={() => setActiveTab('commitments')}
              aria-current={activeTab === 'commitments' ? 'page' : undefined}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 rounded focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none ${
                activeTab === 'commitments'
                  ? 'text-lime-400 font-semibold border-b-2 border-lime-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Commitments
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              aria-current={activeTab === 'goals' ? 'page' : undefined}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 rounded focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none ${
                activeTab === 'goals'
                  ? 'text-lime-400 font-semibold border-b-2 border-lime-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Savings Goals
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              aria-current={activeTab === 'ledger' ? 'page' : undefined}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 rounded focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none ${
                activeTab === 'ledger'
                  ? 'text-lime-400 font-semibold border-b-2 border-lime-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Transactions
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onResetDemo}
              aria-label="Reset demo data to Day 12 baseline"
              title="Reset Demo Data"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Demo</span>
            </button>
            <button
              onClick={onOpenQuickSimulate}
              aria-label="Open Decision Simulator"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-lime-400 hover:bg-lime-300 active:bg-lime-500 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Simulate Expense</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile nav bar with accessible 44px touch targets */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden flex items-center justify-around border-t border-slate-800/60 bg-[#070b14] px-1 py-1 overflow-x-auto"
      >
        <button
          onClick={() => setActiveTab('overview')}
          aria-current={activeTab === 'overview' ? 'page' : undefined}
          className={`min-h-[44px] px-3 flex items-center justify-center text-xs font-medium whitespace-nowrap rounded focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none ${
            activeTab === 'overview' ? 'text-lime-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          aria-current={activeTab === 'simulator' ? 'page' : undefined}
          className={`min-h-[44px] px-3 flex items-center justify-center text-xs font-medium whitespace-nowrap rounded focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none ${
            activeTab === 'simulator' ? 'text-lime-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Simulator
        </button>
        <button
          onClick={() => setActiveTab('commitments')}
          aria-current={activeTab === 'commitments' ? 'page' : undefined}
          className={`min-h-[44px] px-3 flex items-center justify-center text-xs font-medium whitespace-nowrap rounded focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none ${
            activeTab === 'commitments' ? 'text-lime-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Bills
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          aria-current={activeTab === 'goals' ? 'page' : undefined}
          className={`min-h-[44px] px-3 flex items-center justify-center text-xs font-medium whitespace-nowrap rounded focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none ${
            activeTab === 'goals' ? 'text-lime-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Goals
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          aria-current={activeTab === 'ledger' ? 'page' : undefined}
          className={`min-h-[44px] px-3 flex items-center justify-center text-xs font-medium whitespace-nowrap rounded focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none ${
            activeTab === 'ledger' ? 'text-lime-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          History
        </button>
      </nav>
    </header>
  );
};
