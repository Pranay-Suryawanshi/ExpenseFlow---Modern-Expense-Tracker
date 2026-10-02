import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CurrencyCode, DateFilterRange, Expense, CategoryId, SortOption } from './types';
import { INITIAL_SAMPLE_EXPENSES } from './data/categories';
import { exportExpensesToCSV, formatCurrency } from './utils/formatters';
import { laravelApi, getApiConfig } from './services/laravelApi';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { MonthlyExpenseChart } from './components/MonthlyExpenseChart';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { LaravelApiModal } from './components/LaravelApiModal';
import { CheckCircle2, RotateCcw, Plus, Server, FileSpreadsheet, AlertCircle } from 'lucide-react';

const STORAGE_KEY_EXPENSES = 'expenseflow_expenses_v1';
const STORAGE_KEY_CURRENCY = 'expenseflow_currency_v1';

export default function App() {
  // Expense records state
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EXPENSES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse stored expenses', e);
    }
    return INITIAL_SAMPLE_EXPENSES;
  });

  // Currency preference
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CURRENCY);
      if (stored && ['USD', 'EUR', 'GBP', 'INR', 'JPY'].includes(stored)) {
        return stored as CurrencyCode;
      }
    } catch {
      // Ignore
    }
    return 'USD';
  });

  // Filters & State
  const [dateFilter, setDateFilter] = useState<DateFilterRange>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  // API Status & Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiStatus, setApiStatus] = useState<{ online: boolean; message: string }>({
    online: true,
    message: 'Laravel REST API Connected',
  });

  // Toast / feedback message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [lastDeletedExpense, setLastDeletedExpense] = useState<Expense | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Synchronize expenses with Laravel REST API
  const syncWithApi = useCallback(async (silent = false) => {
    setIsSyncing(true);
    try {
      const remoteExpenses = await laravelApi.fetchExpenses();
      if (remoteExpenses && remoteExpenses.length > 0) {
        setExpenses(remoteExpenses);
        setApiStatus({ online: true, message: 'Laravel REST API Online' });
        if (!silent) {
          showToast(`Synced ${remoteExpenses.length} expenses from Laravel API`);
        }
      }
    } catch (err: any) {
      console.warn('API sync fallback to local storage:', err.message);
      setApiStatus({ online: false, message: 'Local Mode (Laravel API offline)' });
      if (!silent) {
        showToast(`API sync error: ${err.message}`, 'error');
      }
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initial fetch from Laravel REST API on app mount
  useEffect(() => {
    syncWithApi(true);
  }, [syncWithApi]);

  // Save to localStorage as a cache/backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save expenses to localStorage', e);
    }
  }, [expenses]);

  // Save currency to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENCY, currency);
    } catch {
      // Ignore
    }
  }, [currency]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Handle Create or Edit Expense via Laravel REST API
  const handleFormSubmit = async (data: Omit<Expense, 'id' | 'createdAt'>) => {
    if (editingExpense) {
      // EDIT EXPENSE
      try {
        const updated = await laravelApi.updateExpense(editingExpense.id, data);
        setExpenses((prev) =>
          prev.map((item) => (item.id === editingExpense.id ? updated : item))
        );
        showToast(`Updated expense: "${updated.title}"`);
      } catch (err: any) {
        // Fallback to local update if API is unreachable
        const fallbackUpdated: Expense = {
          ...editingExpense,
          ...data,
        };
        setExpenses((prev) =>
          prev.map((item) => (item.id === editingExpense.id ? fallbackUpdated : item))
        );
        showToast(`Updated "${data.title}" (Saved locally)`, 'success');
      }
    } else {
      // CREATE EXPENSE
      try {
        const created = await laravelApi.createExpense(data);
        setExpenses((prev) => [created, ...prev]);
        showToast(`Added "${created.title}" for ${formatCurrency(created.amount, currency)}`);
      } catch (err: any) {
        // Fallback to local creation if API is unreachable
        const newExpense: Expense = {
          id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          ...data,
          createdAt: Date.now(),
        };
        setExpenses((prev) => [newExpense, ...prev]);
        showToast(`Added "${data.title}" (Saved locally)`, 'success');
      }
    }
    setEditingExpense(null);
    setIsModalOpen(false);
  };

  // Handle Delete Expense via Laravel REST API
  const handleConfirmDelete = async () => {
    if (!deletingExpense) return;
    const toDelete = deletingExpense;

    try {
      await laravelApi.deleteExpense(toDelete.id);
      setExpenses((prev) => prev.filter((item) => item.id !== toDelete.id));
      setLastDeletedExpense(toDelete);
      showToast(`Deleted "${toDelete.title}"`);
    } catch (err: any) {
      // Local fallback
      setExpenses((prev) => prev.filter((item) => item.id !== toDelete.id));
      setLastDeletedExpense(toDelete);
      showToast(`Deleted "${toDelete.title}" (Local record removed)`);
    } finally {
      setDeletingExpense(null);
    }
  };

  // Undo delete
  const handleUndoDelete = async () => {
    if (!lastDeletedExpense) return;
    const restored = lastDeletedExpense;
    try {
      const created = await laravelApi.createExpense({
        title: restored.title,
        amount: restored.amount,
        category: restored.category,
        date: restored.date,
        paymentMethod: restored.paymentMethod,
        notes: restored.notes,
      });
      setExpenses((prev) => [created, ...prev]);
    } catch {
      setExpenses((prev) => [restored, ...prev]);
    }
    showToast(`Restored "${restored.title}"`);
    setLastDeletedExpense(null);
  };

  // Reset to sample data
  const handleResetSampleData = () => {
    setExpenses(INITIAL_SAMPLE_EXPENSES);
    setSelectedCategory('all');
    setSelectedMonth(null);
    setSearchQuery('');
    setDateFilter('all');
    showToast('Reset to default sample expenses');
  };

  // Clear all data
  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all recorded expenses?')) {
      setExpenses([]);
      showToast('All expenses cleared');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (expenses.length === 0) return;
    exportExpensesToCSV(expenses, currency);
    showToast('Exported expenses to CSV file');
  };

  // Filtered and sorted expenses computation
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // 1. Month Filter from Monthly Chart
      if (selectedMonth && !exp.date.startsWith(selectedMonth)) {
        return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'all' && exp.category !== selectedCategory) {
        return false;
      }

      // 3. Date Scope Filter
      if (dateFilter !== 'all') {
        const expDate = new Date(exp.date + 'T00:00:00');
        const now = new Date();

        if (dateFilter === 'this_month') {
          const isThisMonth =
            expDate.getFullYear() === now.getFullYear() &&
            expDate.getMonth() === now.getMonth();
          if (!isThisMonth) return false;
        } else if (dateFilter === 'last_30_days') {
          const diffMs = now.getTime() - expDate.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          if (diffDays < 0 || diffDays > 30) return false;
        }
      }

      // 4. Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = exp.title.toLowerCase().includes(query);
        const matchesNote = exp.notes?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesNote) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      switch (sortOption) {
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt;
        case 'amount_desc':
          return b.amount - a.amount;
        case 'amount_asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });
  }, [expenses, selectedCategory, selectedMonth, dateFilter, searchQuery, sortOption]);

  const apiConfig = getApiConfig();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header Contract */}
      <Header
        onOpenAddModal={() => {
          setEditingExpense(null);
          setIsModalOpen(true);
        }}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        onExportCSV={handleExportCSV}
        onResetData={handleResetSampleData}
        currency={currency}
        onCurrencyChange={setCurrency}
        dateFilter={dateFilter}
        onDateFilterChange={(df) => {
          setDateFilter(df);
          if (df !== 'all') setSelectedMonth(null);
        }}
        expenseCount={expenses.length}
      />

      {/* Contextual REST API status bar */}
      <div className="bg-slate-100/80 border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-1.5 text-xs text-slate-600 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="font-semibold text-slate-800">{apiStatus.message}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="hidden sm:inline font-mono text-[11px] text-slate-500">
              Endpoint: {apiConfig.baseUrl}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => syncWithApi(false)}
              disabled={isSyncing}
              className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline disabled:opacity-50"
            >
              {isSyncing ? 'Syncing...' : 'Sync with API'}
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
            >
              API Docs & Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Metric Cards Banner */}
        <section aria-label="Financial Summary Metrics">
          <MetricCards expenses={expenses} currency={currency} />
        </section>

        {/* Monthly Expense Chart */}
        <section aria-label="Monthly Expense Visualization">
          <MonthlyExpenseChart
            expenses={expenses}
            currency={currency}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
          />
        </section>

        {/* Category Breakdown Graph & Analysis */}
        <section aria-label="Category Distribution">
          <CategoryBreakdown
            expenses={expenses}
            currency={currency}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </section>

        {/* Expenses List & Filter Table with Edit Functionality */}
        <section aria-label="Expenses Log">
          <ExpenseList
            expenses={expenses}
            filteredExpenses={filteredExpenses}
            currency={currency}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortOption={sortOption}
            onSortChange={setSortOption}
            onEditExpense={(exp) => {
              setEditingExpense(exp);
              setIsModalOpen(true);
            }}
            onDeleteClick={(exp) => {
              setDeletingExpense(exp);
            }}
            onOpenAddModal={() => {
              setEditingExpense(null);
              setIsModalOpen(true);
            }}
            onResetSampleData={handleResetSampleData}
          />
        </section>

        {/* Quick Ledger Utility Footer Bar */}
        <footer className="pt-6 pb-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <span>ExpenseFlow Personal Budget</span>
            <span aria-hidden="true">·</span>
            <span>Laravel REST API & Local persistence active</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Server className="w-3.5 h-3.5 text-red-500" />
              <span>Laravel API Specs</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleExportCSV}
              disabled={expenses.length === 0}
              className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleResetSampleData}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Reload Sample Data
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleClearAllData}
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              Clear All Entries
            </button>
          </div>
        </footer>
      </main>

      {/* Floating Add Expense Button for Mobile Screens */}
      <div className="sm:hidden fixed bottom-5 right-5 z-40">
        <button
          onClick={() => {
            setEditingExpense(null);
            setIsModalOpen(true);
          }}
          className="w-13 h-13 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          aria-label="Add Expense"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Add / Edit Expense Modal Dialog */}
      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingExpense}
        currency={currency}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingExpense)}
        expense={deletingExpense}
        currency={currency}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingExpense(null)}
      />

      {/* Laravel REST API Configuration Modal */}
      <LaravelApiModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onSyncData={syncWithApi}
        isSyncing={isSyncing}
      />

      {/* Toast Notification Container */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-lg border flex items-center gap-3 transition-all ${
            toastType === 'error'
              ? 'bg-rose-950 border-rose-800'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          {toastType === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage}</span>
          {lastDeletedExpense && toastMessage.startsWith('Deleted') && (
            <button
              onClick={handleUndoDelete}
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 ml-2 underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
