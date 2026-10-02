import React from 'react';
import { Plus, Download, RefreshCw, Wallet, Server } from 'lucide-react';
import { CurrencyCode, DateFilterRange } from '../types';
import { CURRENCIES } from '../data/categories';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenApiModal: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  dateFilter: DateFilterRange;
  onDateFilterChange: (df: DateFilterRange) => void;
  expenseCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenApiModal,
  onExportCSV,
  onResetData,
  currency,
  onCurrencyChange,
  dateFilter,
  onDateFilterChange,
  expenseCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                ExpenseFlow
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                Personal Finance Ledger
              </span>
            </div>
          </div>

          {/* Zone 2: Date Scope Filter Controls (Interactive Segmented Control) */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/60">
            <button
              onClick={() => onDateFilterChange('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                dateFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => onDateFilterChange('this_month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                dateFilter === 'this_month'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => onDateFilterChange('last_30_days')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                dateFilter === 'last_30_days'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 30 Days
            </button>
          </nav>

          {/* Zone 3: Actions (Laravel API, Currency, Export, Add Expense) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Laravel REST API Config Button */}
            <button
              onClick={onOpenApiModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 rounded-lg transition-colors cursor-pointer"
              title="Laravel REST API Configuration"
            >
              <Server className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden sm:inline">Laravel API</span>
            </button>

            {/* Currency selector */}
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg py-1.5 px-2 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                title="Select Currency"
                aria-label="Select Currency"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Export CSV */}
            <button
              onClick={onExportCSV}
              disabled={expenseCount === 0}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              title="Export to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>

            {/* Reset sample data icon button */}
            <button
              onClick={onResetData}
              className="hidden xl:inline-flex items-center p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-transparent transition-colors cursor-pointer"
              title="Reset Sample Expenses"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Add Expense Primary Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

