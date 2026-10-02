import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { CurrencyCode, Expense } from '../types';
import { formatCurrency, formatDisplayDate } from '../utils/formatters';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  expense: Expense | null;
  currency: CurrencyCode;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  expense,
  currency,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5" />
        </div>

        <h3 className="text-base font-bold text-slate-900">
          Delete this expense?
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Are you sure you want to remove this record? This action cannot be undone.
        </p>

        <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
          <div className="text-sm font-semibold text-slate-900 truncate">
            {expense.title}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
            <span>{formatDisplayDate(expense.date)}</span>
            <span className="font-bold text-slate-900 font-mono tabular-nums">
              {formatCurrency(expense.amount, currency)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-6">
          <button
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};
