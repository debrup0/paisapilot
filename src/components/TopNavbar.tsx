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
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            <span>Paisa<span className="text-lime-400">Pilot</span></span>
            <span className="text-xs font-mono text-slate-400 font-normal">Day {currentDay}/30</span>
          </button>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'overview'
                  ? 'text-lime-400 font-semibold border-b-2 border-lime-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'simulator'
                  ? 'text-lime-400 font-semibold border-b-2 border-lime-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Decision Simulator
            </button>
            <button
              onClick={() => setActiveTab('commitments')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'commitments'
                  ? 'text-lime-400 font-semibold border-b-2 border-lime-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Commitments
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'goals'
                  ? 'text-lime-400 font-semibold border-b-2 border-lime-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Savings Goals
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
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
              title="Reset Demo Data"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
            <button
              onClick={onOpenQuickSimulate}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-lime-400 hover:bg-lime-300 active:bg-lime-500 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Expense</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/60 bg-[#070b14] px-2 py-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
            activeTab === 'overview' ? 'text-lime-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
            activeTab === 'simulator' ? 'text-lime-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Simulator
        </button>
        <button
          onClick={() => setActiveTab('commitments')}
          className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
            activeTab === 'commitments' ? 'text-lime-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Bills
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
            activeTab === 'goals' ? 'text-lime-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Goals
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
            activeTab === 'ledger' ? 'text-lime-400 font-semibold' : 'text-slate-400'
          }`}
        >
          History
        </button>
      </div>
    </header>
  );
};
