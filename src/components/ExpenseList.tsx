import React from 'react';
import { Search, Filter, ArrowUpDown, Trash2, Edit3, Plus, CreditCard, Banknote, Smartphone, ArrowRightLeft } from 'lucide-react';
import { CategoryId, CurrencyCode, Expense, PaymentMethod, SortOption } from '../types';
import { CATEGORIES } from '../data/categories';
import { formatCurrency, formatDisplayDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface ExpenseListProps {
  expenses: Expense[];
  filteredExpenses: Expense[];
  currency: CurrencyCode;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryId | 'all';
  onCategoryChange: (category: CategoryId | 'all') => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteClick: (expense: Expense) => void;
  onOpenAddModal: () => void;
  onResetSampleData: () => void;
}

const PAYMENT_LABELS: Record<PaymentMethod, { label: string; icon: React.FC<{ className?: string }> }> = {
  card: { label: 'Card', icon: CreditCard },
  cash: { label: 'Cash', icon: Banknote },
  digital_wallet: { label: 'Digital Wallet', icon: Smartphone },
  transfer: { label: 'Transfer', icon: ArrowRightLeft },
};

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  filteredExpenses,
  currency,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortOption,
  onSortChange,
  onEditExpense,
  onDeleteClick,
  onOpenAddModal,
  onResetSampleData,
}) => {
  const filteredTotal = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  const isFiltered = searchQuery.trim() !== '' || selectedCategory !== 'all';

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Search & Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search expenses by title or note..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter & Sort Options */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value as CategoryId | 'all')}
                className="appearance-none bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                aria-label="Filter by Category"
              >
                <option value="all">All Categories</option>
                {Object.values(CATEGORIES).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="appearance-none bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                aria-label="Sort Expenses"
              >
                <option value="date_desc">Date (Newest first)</option>
                <option value="date_asc">Date (Oldest first)</option>
                <option value="amount_desc">Amount (Highest first)</option>
                <option value="amount_asc">Amount (Lowest first)</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter Summary & Quick Reset */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/60 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="font-semibold text-slate-800">{filteredExpenses.length}</strong> of{' '}
              <strong className="font-semibold text-slate-800">{expenses.length}</strong> expenses
            </span>
            {isFiltered && (
              <>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => {
                    onSearchChange('');
                    onCategoryChange('all');
                  }}
                  className="font-semibold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                >
                  Reset filters
                </button>
              </>
            )}
          </div>

          <div className="font-medium text-slate-700">
            Filtered Subtotal:{' '}
            <strong className="font-bold text-slate-900 font-mono tabular-nums">
              {formatCurrency(filteredTotal, currency)}
            </strong>
          </div>
        </div>
      </div>

      {/* Expense Items List */}
      {filteredExpenses.length === 0 ? (
        <div className="py-16 px-4 text-center">
          {expenses.length === 0 ? (
            <div className="max-w-xs mx-auto">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No expenses recorded yet</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Start tracking your daily purchases and financial outlays.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={onOpenAddModal}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log First Expense</span>
                </button>
                <button
                  onClick={onResetSampleData}
                  className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Load Sample Data
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-xs mx-auto">
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No matching expenses</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                No entries match your search query or selected category filter.
              </p>
              <button
                onClick={() => {
                  onSearchChange('');
                  onCategoryChange('all');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredExpenses.map((exp) => {
            const cat = CATEGORIES[exp.category] || CATEGORIES.other;
            const payment = PAYMENT_LABELS[exp.paymentMethod] || PAYMENT_LABELS.card;
            const PaymentIcon = payment.icon;

            return (
              <div
                key={exp.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 hover:bg-slate-50/80 transition-colors gap-3"
              >
                {/* Left side: Category icon & Details */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: cat.bgColor, color: cat.color }}
                  >
                    <CategoryIcon categoryId={exp.category} className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {exp.title}
                    </div>

                    {/* Zero-Pill Metadata line with subtle typographic separators */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-700">
                        {cat.label}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-mono tabular-nums">
                        {formatDisplayDate(exp.date)}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <PaymentIcon className="w-3 h-3" />
                        <span>{payment.label}</span>
                      </span>
                    </div>

                    {/* Note if exists */}
                    {exp.notes && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
                        "{exp.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side: Amount & Action buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Amount */}
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-slate-900">
                      -{formatCurrency(exp.amount, currency)}
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 opacity-90 sm:opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditExpense(exp)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                      title="Edit expense"
                      aria-label={`Edit ${exp.title}`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteClick(exp)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Delete expense"
                      aria-label={`Delete ${exp.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
