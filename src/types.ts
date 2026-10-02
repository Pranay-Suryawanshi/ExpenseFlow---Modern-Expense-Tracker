export type CategoryId =
  | 'food'
  | 'transport'
  | 'housing'
  | 'utilities'
  | 'entertainment'
  | 'health'
  | 'shopping'
  | 'education'
  | 'other';

export type PaymentMethod = 'card' | 'cash' | 'transfer' | 'digital_wallet';

export interface Category {
  id: CategoryId;
  label: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: CategoryId;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number;
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export type DateFilterRange = 'all' | 'this_month' | 'last_month' | 'last_30_days' | 'this_year';

export type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
