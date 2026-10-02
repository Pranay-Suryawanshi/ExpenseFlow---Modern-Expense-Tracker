import React from 'react';
import { DollarSign, TrendingDown, Receipt, PieChart } from 'lucide-react';
import { CurrencyCode, Expense } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CATEGORIES } from '../data/categories';

interface MetricCardsProps {
  expenses: Expense[];
  currency: CurrencyCode;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ expenses, currency }) => {
  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);
  const averageAmount = expenses.length > 0 ? totalAmount / expenses.length : 0;

  // Find top spending category
  const categoryTotals = expenses.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  let topCategoryName = 'None';
  let topCategoryAmount = 0;
  Object.entries(categoryTotals).forEach(([catId, amt]) => {
    if (amt > topCategoryAmount) {
      topCategoryAmount = amt;
      topCategoryName = CATEGORIES[catId as keyof typeof CATEGORIES]?.label || catId;
    }
  });

  const topCategoryPercent = totalAmount > 0 ? Math.round((topCategoryAmount / totalAmount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Expenses */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Spent
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalAmount, currency)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Cumulative expenditure
          </div>
        </div>
      </div>

      {/* Average Transaction */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Average Expense
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {formatCurrency(averageAmount, currency)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Per recorded transaction
          </div>
        </div>
      </div>

      {/* Total Transactions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Transactions
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {expenses.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {expenses.length === 1 ? '1 expense logged' : `${expenses.length} expenses logged`}
          </div>
        </div>
      </div>

      {/* Top Category */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Top Category
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <PieChart className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 truncate">
            {topCategoryName}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {topCategoryAmount > 0 ? (
              <span>
                <strong className="font-semibold text-slate-700 font-mono tabular-nums">
                  {formatCurrency(topCategoryAmount, currency)}
                </strong>{' '}
                ({topCategoryPercent}% of total)
              </span>
            ) : (
              'No expense data yet'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
