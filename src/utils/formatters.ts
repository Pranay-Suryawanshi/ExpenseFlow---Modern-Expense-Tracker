import { CurrencyCode, Expense } from '../types';
import { CATEGORIES } from '../data/categories';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const isJpy = currency === 'JPY';

  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: isJpy ? 0 : 2,
    maximumFractionDigits: isJpy ? 0 : 2,
  }).format(amount);

  return `${symbol}${formattedNumber}`;
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const [year, month, day] = parts.map(Number);
  const dateObj = new Date(year, month - 1, day);

  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function exportExpensesToCSV(expenses: Expense[], currency: CurrencyCode = 'USD'): void {
  const headers = ['Date', 'Title', 'Category', 'Amount', 'Currency', 'Payment Method', 'Notes'];
  
  const rows = expenses.map((exp) => {
    const categoryName = CATEGORIES[exp.category]?.label || exp.category;
    const cleanNotes = (exp.notes || '').replace(/"/g, '""');
    const cleanTitle = exp.title.replace(/"/g, '""');
    return [
      exp.date,
      `"${cleanTitle}"`,
      `"${categoryName}"`,
      exp.amount.toFixed(2),
      currency,
      exp.paymentMethod || 'card',
      `"${cleanNotes}"`,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const today = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `expenses_export_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
