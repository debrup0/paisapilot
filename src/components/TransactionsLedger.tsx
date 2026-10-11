import React, { useState, useMemo } from 'react';
import { Transaction, CategoryId, TransactionType } from '../types/finance';
import { CATEGORIES, formatINR } from '../utils/formatters';
import {
  Search,
  Plus,
  Trash2,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

interface TransactionsLedgerProps {
  transactions: Transaction[];
  currentDay: number;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsLedger: React.FC<TransactionsLedgerProps> = ({
  transactions,
  currentDay,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState(currentDay.toString());
  const [category, setCategory] = useState<CategoryId>('food');
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [notes, setNotes] = useState('');

  // Memoize filtered transactions to avoid recalculations on every render
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (
          searchTerm &&
          !tx.title.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }
        if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
          return false;
        }
        if (selectedType !== 'all' && tx.type !== selectedType) {
          return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          b.day - a.day ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [transactions, searchTerm, selectedCategory, selectedType]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    const parsedDay = parseInt(day, 10);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || isNaN(parsedDay)) {
      return;
    }

    onAddTransaction({
      title: title.trim(),
      amount: parsedAmount,
      day: Math.min(30, Math.max(1, parsedDay)),
      category,
      type: txType,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setAmount('');
    setNotes('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-lime-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Transaction History
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ({transactions.length} recorded)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Every confirmed expense automatically deducts from your ₹10,000 monthly balance.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-lime-400 hover:bg-lime-300 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Manual Entry Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateSubmit}
          className="rounded-2xl bg-slate-900 border border-lime-400/30 p-5 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs uppercase tracking-wider font-bold text-lime-400">
              Record Confirmed Transaction
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-500 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Description
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Swiggy Lunch, Auto Fare"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="250"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono tabular-nums focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Day (1-30)
              </label>
              <input
                type="number"
                required
                min="1"
                max="30"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono tabular-nums focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-sm text-white focus:outline-none focus:border-lime-400"
              >
                {Object.values(CATEGORIES).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Type
              </label>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value as TransactionType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-sm text-white focus:outline-none focus:border-lime-400"
              >
                <option value="expense">Expense (Debit)</option>
                <option value="refund">Refund (Credit)</option>
                <option value="savings_deposit">Savings Deposit</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-lime-400 hover:bg-lime-300 rounded-lg transition-colors"
            >
              Save Transaction
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search by title..."
            aria-label="Search transactions by title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-lime-400 focus-visible:ring-2 focus-visible:ring-lime-400"
          />
        </div>

        {/* Filter Selects */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            aria-label="Filter transactions by category"
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-lime-400 focus-visible:ring-2 focus-visible:ring-lime-400"
          >
            <option value="all">All Categories</option>
            {Object.values(CATEGORIES).map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            aria-label="Filter transactions by type"
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-lime-400 focus-visible:ring-2 focus-visible:ring-lime-400"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="refund">Refunds Only</option>
            <option value="savings_deposit">Savings Deposits</option>
          </select>
        </div>
      </div>

      {/* Ledger Rows */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No transactions found matching the filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredTransactions.map((tx) => {
              const cat = CATEGORIES[tx.category] || CATEGORIES.other;
              const isDebit = tx.type === 'expense';
              const isRefund = tx.type === 'refund';

              return (
                <div
                  key={tx.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.lightBg }}
                    >
                      {isDebit ? (
                        <ArrowUpRight className="w-4 h-4" style={{ color: cat.color }} />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {tx.title}
                        </span>
                      </div>
                      
                      {/* Zero-Pill Unboxed Metadata */}
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span style={{ color: cat.color }}>{cat.label}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">Day {tx.day} of 30</span>
                        {tx.isRecurring && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-400">Recurring</span>
                          </>
                        )}
                        {tx.notes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-400 truncate max-w-xs">{tx.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm font-bold font-mono tabular-nums ${
                        isDebit
                          ? 'text-white'
                          : isRefund
                          ? 'text-emerald-400'
                          : 'text-lime-300'
                      }`}
                    >
                      {isDebit ? '-' : '+'}
                      {formatINR(tx.amount)}
                    </span>

                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      title="Delete Transaction"
                      aria-label={`Delete transaction: ${tx.title} of ${formatINR(tx.amount)}`}
                      className="p-1.5 text-slate-400 hover:text-rose-400 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none transition-colors rounded min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
