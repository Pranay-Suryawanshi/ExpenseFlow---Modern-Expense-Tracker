import React from 'react';
import { CategoryId, CurrencyCode, Expense } from '../types';
import { CATEGORIES } from '../data/categories';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface CategoryBreakdownProps {
  expenses: Expense[];
  currency: CurrencyCode;
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (categoryId: CategoryId | 'all') => void;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  expenses,
  currency,
  selectedCategory,
  onSelectCategory,
}) => {
  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Calculate amount and count per category
  const breakdown = Object.keys(CATEGORIES).map((catIdKey) => {
    const catId = catIdKey as CategoryId;
    const catConfig = CATEGORIES[catId];
    const catExpenses = expenses.filter((e) => e.category === catId);
    const amount = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;

    return {
      catId,
      label: catConfig.label,
      color: catConfig.color,
      bgColor: catConfig.bgColor,
      amount,
      count: catExpenses.length,
      percentage,
    };
  });

  // Filter to categories that have spending (or show all if empty)
  const activeBreakdown = breakdown
    .filter((b) => b.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-slate-900">
            Category Breakdown
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Spending distribution across budget categories
          </p>
        </div>

        {selectedCategory !== 'all' && (
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline transition-colors cursor-pointer"
          >
            Show All Categories
          </button>
        )}
      </div>

      {activeBreakdown.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No expenses recorded to analyze
        </div>
      ) : (
        <div className="space-y-3">
          {/* Multi-segment distribution line */}
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
            {activeBreakdown.map((item) => (
              <div
                key={item.catId}
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
                className="h-full transition-all duration-300"
                title={`${item.label}: ${item.percentage.toFixed(1)}%`}
              />
            ))}
          </div>

          {/* List of active categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
            {activeBreakdown.map((item) => {
              const isSelected = selectedCategory === item.catId;
              return (
                <button
                  key={item.catId}
                  onClick={() => onSelectCategory(isSelected ? 'all' : item.catId)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                      : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: item.bgColor, color: item.color }}
                    >
                      <CategoryIcon categoryId={item.catId} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.count} {item.count === 1 ? 'item' : 'items'} · {item.percentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <span className="text-xs font-bold text-slate-900 font-mono tabular-nums block">
                      {formatCurrency(item.amount, currency)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
