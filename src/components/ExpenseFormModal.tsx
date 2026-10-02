import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Calendar, Tag, CreditCard, FileText, Zap } from 'lucide-react';
import { CategoryId, CurrencyCode, Expense, PaymentMethod } from '../types';
import { CATEGORIES } from '../data/categories';
import { CURRENCY_SYMBOLS } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Expense, 'id' | 'createdAt'>) => void;
  initialData?: Expense | null;
  currency: CurrencyCode;
}

const PRESETS: Array<{ title: string; amount: number; category: CategoryId; notes?: string }> = [
  { title: 'Morning Espresso & Pastry', amount: 5.5, category: 'food' },
  { title: 'Lunch Special', amount: 15.0, category: 'food' },
  { title: 'Weekly Groceries', amount: 65.0, category: 'food' },
  { title: 'Metro / Transit Fare', amount: 3.25, category: 'transport' },
  { title: 'Rideshare / Taxi', amount: 22.5, category: 'transport' },
  { title: 'Pharmacy & Health Supplies', amount: 18.0, category: 'health' },
  { title: 'Streaming & Media', amount: 14.99, category: 'entertainment' },
];

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  currency,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>('food');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ title?: string; amount?: string; date?: string }>({});

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDate(initialData.date);
      setPaymentMethod(initialData.paymentMethod || 'card');
      setNotes(initialData.notes || '');
    } else {
      // Set default today in local ISO YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setAmount('');
      setCategory('food');
      setDate(today);
      setPaymentMethod('card');
      setNotes('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.title);
    setAmount(preset.amount.toString());
    setCategory(preset.category);
    if (errors.title || errors.amount) {
      setErrors((prev) => ({ ...prev, title: undefined, amount: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; amount?: string; date?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Please enter an expense description or title.';
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Please enter a valid positive number for amount.';
    }

    if (!date) {
      newErrors.date = 'Please select a date.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      title: title.trim(),
      amount: Math.round(parsedAmount * 100) / 100,
      category,
      date,
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEditing ? 'Edit Expense Record' : 'Record New Expense'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? 'Update transaction details and category categorization'
                : 'Log a spending item to keep your budget balanced'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Quick Preset Selector for new entries */}
          {!isEditing && (
            <div className="pb-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Fill Suggestions</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {PRESETS.slice(0, 4).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200/80 text-slate-700 font-medium whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {p.title.split(' ')[0]} ({symbol}{p.amount})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount & Date side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Amount ({symbol}) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-semibold pointer-events-none">
                  {symbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-3 py-2.5 bg-white border rounded-lg text-base font-mono font-bold tabular-nums text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                    errors.amount ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                  autoFocus={!isEditing}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.amount}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                    errors.date ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.date && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.date}</p>
              )}
            </div>
          </div>

          {/* Description / Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Title / Description *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grocery run, Monthly train pass, Coffee"
              className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.title}</p>
            )}
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Category *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(CATEGORIES).map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.bgColor, color: cat.color }}
                    >
                      <CategoryIcon categoryId={cat.id} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method & Optional Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                <option value="card">Credit / Debit Card</option>
                <option value="cash">Cash</option>
                <option value="digital_wallet">Digital Wallet (Apple/Google Pay)</option>
                <option value="transfer">Bank Transfer / Wire</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Note (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional tag or memo"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Add Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
