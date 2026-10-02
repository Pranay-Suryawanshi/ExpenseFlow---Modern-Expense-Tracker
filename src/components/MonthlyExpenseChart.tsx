import React, { useState, useMemo } from 'react';
import { CurrencyCode, Expense } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CATEGORIES } from '../data/categories';
import { TrendingUp, TrendingDown, Calendar, BarChart3, FilterX } from 'lucide-react';

interface MonthlyExpenseChartProps {
  expenses: Expense[];
  currency: CurrencyCode;
  selectedMonth: string | null; // e.g. "2026-10" or null
  onSelectMonth: (month: string | null) => void;
}

interface MonthData {
  key: string; // "YYYY-MM"
  label: string; // "Oct '26"
  fullLabel: string; // "October 2026"
  total: number;
  count: number;
  topCategory: string;
}

export const MonthlyExpenseChart: React.FC<MonthlyExpenseChartProps> = ({
  expenses,
  currency,
  selectedMonth,
  onSelectMonth,
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  // Group expenses by YYYY-MM
  const monthlyData = useMemo(() => {
    // Collect all year-months
    const groups: Record<string, { total: number; count: number; categories: Record<string, number> }> = {};

    expenses.forEach((exp) => {
      if (!exp.date) return;
      const monthKey = exp.date.substring(0, 7); // "YYYY-MM"
      if (!groups[monthKey]) {
        groups[monthKey] = { total: 0, count: 0, categories: {} };
      }
      groups[monthKey].total += exp.amount;
      groups[monthKey].count += 1;
      groups[monthKey].categories[exp.category] = (groups[monthKey].categories[exp.category] || 0) + exp.amount;
    });

    // If fewer than 6 months, let's ensure the current and recent months are represented
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${y}-${m}`;
      if (!groups[key]) {
        groups[key] = { total: 0, count: 0, categories: {} };
      }
    }

    // Sort chronologically
    const sortedKeys = Object.keys(groups).sort();
    // Keep at most last 8 months for clean visualization
    const displayKeys = sortedKeys.slice(-8);

    return displayKeys.map((key) => {
      const g = groups[key];
      const [year, month] = key.split('-').map(Number);
      const dateObj = new Date(year, month - 1, 1);
      const shortLabel = dateObj.toLocaleDateString('en-US', { month: 'short' }) + " '" + String(year).slice(-2);
      const fullLabel = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      // Find top category
      let topCat = 'None';
      let maxCatAmt = 0;
      Object.entries(g.categories).forEach(([c, amt]) => {
        if (amt > maxCatAmt) {
          maxCatAmt = amt;
          topCat = CATEGORIES[c as keyof typeof CATEGORIES]?.label || c;
        }
      });

      return {
        key,
        label: shortLabel,
        fullLabel,
        total: Math.round(g.total * 100) / 100,
        count: g.count,
        topCategory: topCat,
      };
    });
  }, [expenses]);

  // Max total for scaling bar heights
  const maxTotal = useMemo(() => {
    const max = Math.max(...monthlyData.map((m) => m.total), 0);
    return max > 0 ? max : 100;
  }, [monthlyData]);

  // Key metrics
  const totalMonthsWithSpend = monthlyData.filter((m) => m.total > 0).length;
  const overallSpend = monthlyData.reduce((sum, m) => sum + m.total, 0);
  const avgMonthlySpend = totalMonthsWithSpend > 0 ? overallSpend / totalMonthsWithSpend : 0;

  // Month-over-month calculation for latest 2 months
  const latestMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData.length >= 2 ? monthlyData[monthlyData.length - 2] : null;

  let momChangePercent: number | null = null;
  if (previousMonth && previousMonth.total > 0 && latestMonth) {
    momChangePercent = Math.round(((latestMonth.total - previousMonth.total) / previousMonth.total) * 100);
  }

  // Active or hovered details
  const activeDetail = useMemo(() => {
    const targetKey = hoveredMonth || selectedMonth;
    if (!targetKey) return null;
    return monthlyData.find((m) => m.key === targetKey) || null;
  }, [hoveredMonth, selectedMonth, monthlyData]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-slate-900">
              Monthly Expense Chart
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual trends across billing periods. Click any month bar to filter transactions.
          </p>
        </div>

        {/* Selected Month Filter Pill / Clear Action */}
        <div className="flex items-center gap-3">
          {selectedMonth ? (
            <button
              onClick={() => onSelectMonth(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              <span>Filtered to {monthlyData.find((m) => m.key === selectedMonth)?.label}</span>
              <FilterX className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {momChangePercent !== null && (
                <div className="flex items-center gap-1">
                  {momChangePercent >= 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-rose-600 font-semibold font-mono tabular-nums">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{momChangePercent}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold font-mono tabular-nums">
                      <TrendingDown className="w-3.5 h-3.5" />
                      {momChangePercent}%
                    </span>
                  )}
                  <span className="hidden sm:inline text-slate-400">vs last month</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chart Visualization Area */}
      <div className="relative pt-2 pb-1">
        {/* Active Hover / Selection Info Banner */}
        <div className="h-6 mb-2 flex items-center justify-between text-xs">
          {activeDetail ? (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{activeDetail.fullLabel}:</span>
              <span className="font-bold text-emerald-700 font-mono tabular-nums">
                {formatCurrency(activeDetail.total, currency)}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600">
                {activeDetail.count} {activeDetail.count === 1 ? 'transaction' : 'transactions'}
              </span>
              {activeDetail.topCategory !== 'None' && (
                <>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">
                    Top: <strong className="text-slate-700 font-semibold">{activeDetail.topCategory}</strong>
                  </span>
                </>
              )}
            </div>
          ) : (
            <span className="text-slate-400 italic">
              Hover over or click any column to inspect monthly volume
            </span>
          )}

          <span className="hidden sm:inline text-[11px] text-slate-400 font-mono tabular-nums">
            Monthly Avg: {formatCurrency(avgMonthlySpend, currency)}
          </span>
        </div>

        {/* Visual Bar Columns Grid */}
        <div className="h-44 sm:h-52 w-full flex items-end gap-2 sm:gap-4 pt-6 border-b border-slate-200">
          {monthlyData.map((item) => {
            const heightPercent = maxTotal > 0 ? Math.max((item.total / maxTotal) * 100, item.total > 0 ? 6 : 2) : 2;
            const isSelected = selectedMonth === item.key;
            const isHovered = hoveredMonth === item.key;

            return (
              <div
                key={item.key}
                className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
                onMouseEnter={() => setHoveredMonth(item.key)}
                onMouseLeave={() => setHoveredMonth(null)}
                onClick={() => onSelectMonth(isSelected ? null : item.key)}
              >
                {/* Amount Label on top of bar */}
                <div
                  className={`text-[10px] sm:text-xs font-mono tabular-nums mb-1.5 transition-all truncate max-w-full px-0.5 ${
                    isSelected || isHovered
                      ? 'font-bold text-emerald-700'
                      : item.total > 0
                      ? 'text-slate-500'
                      : 'text-transparent'
                  }`}
                >
                  {item.total > 0 ? formatCurrency(item.total, currency) : '$0'}
                </div>

                {/* Animated Vertical Bar */}
                <div className="w-full max-w-[48px] h-full flex items-end">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 relative ${
                      isSelected
                        ? 'bg-emerald-600 shadow-md ring-2 ring-emerald-400 ring-offset-1'
                        : isHovered
                        ? 'bg-emerald-500'
                        : item.total > 0
                        ? 'bg-emerald-400/80 group-hover:bg-emerald-500'
                        : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}
                  />
                </div>

                {/* Month Label below bar */}
                <div className="pt-2 pb-1 text-center w-full">
                  <span
                    className={`block text-[11px] sm:text-xs font-semibold truncate transition-colors ${
                      isSelected
                        ? 'text-emerald-700 font-bold'
                        : isHovered
                        ? 'text-slate-900'
                        : 'text-slate-600'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono tabular-nums">
                    {item.count > 0 ? `${item.count}tx` : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 mt-1 text-xs text-slate-500">
        <div>
          <span className="text-slate-400 block text-[11px]">Period Spending</span>
          <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
            {formatCurrency(overallSpend, currency)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Average Per Active Month</span>
          <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
            {formatCurrency(avgMonthlySpend, currency)}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1 text-right sm:text-left">
          <span className="text-slate-400 block text-[11px]">Peak Spending Month</span>
          <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
            {formatCurrency(maxTotal, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};
