import { Category, CategoryId, CurrencyConfig, Expense } from '../types';

export const CATEGORIES: Record<CategoryId, Category> = {
  food: {
    id: 'food',
    label: 'Food & Dining',
    iconName: 'Utensils',
    color: '#059669', // emerald-600
    bgColor: '#ecfdf5', // emerald-50
    borderColor: '#a7f3d0', // emerald-200
  },
  transport: {
    id: 'transport',
    label: 'Transportation',
    iconName: 'Car',
    color: '#2563eb', // blue-600
    bgColor: '#eff6ff', // blue-50
    borderColor: '#bfdbfe', // blue-200
  },
  housing: {
    id: 'housing',
    label: 'Housing & Rent',
    iconName: 'Home',
    color: '#7c3aed', // purple-600
    bgColor: '#f5f3ff', // purple-50
    borderColor: '#ddd6fe', // purple-200
  },
  utilities: {
    id: 'utilities',
    label: 'Utilities & Bills',
    iconName: 'Zap',
    color: '#d97706', // amber-600
    bgColor: '#fffbeb', // amber-50
    borderColor: '#fde68a', // amber-200
  },
  entertainment: {
    id: 'entertainment',
    label: 'Entertainment',
    iconName: 'Film',
    color: '#e11d48', // rose-600
    bgColor: '#fff1f2', // rose-50
    borderColor: '#fecdd3', // rose-200
  },
  health: {
    id: 'health',
    label: 'Health & Wellness',
    iconName: 'HeartPulse',
    color: '#0d9488', // teal-600
    bgColor: '#f0fdfa', // teal-50
    borderColor: '#99f6e4', // teal-200
  },
  shopping: {
    id: 'shopping',
    label: 'Shopping',
    iconName: 'ShoppingBag',
    color: '#4f46e5', // indigo-600
    bgColor: '#eef2ff', // indigo-50
    borderColor: '#c7d2fe', // indigo-200
  },
  education: {
    id: 'education',
    label: 'Work & Education',
    iconName: 'GraduationCap',
    color: '#0284c7', // sky-600
    bgColor: '#f0f9ff', // sky-50
    borderColor: '#bae6fd', // sky-200
  },
  other: {
    id: 'other',
    label: 'General & Other',
    iconName: 'Layers',
    color: '#64748b', // slate-500
    bgColor: '#f8fafc', // slate-50
    borderColor: '#cbd5e1', // slate-300
  },
};

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
];

export const INITIAL_SAMPLE_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'Whole Foods Market',
    amount: 86.45,
    category: 'food',
    date: '2026-10-02',
    paymentMethod: 'card',
    notes: 'Organic produce, berries, and pantry essentials',
    createdAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'exp-2',
    title: 'Metro Monthly Transit Pass',
    amount: 72.0,
    category: 'transport',
    date: '2026-10-01',
    paymentMethod: 'card',
    notes: 'Subway & bus unlimited for October',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: 'exp-3',
    title: 'High-speed Fiber Internet',
    amount: 65.0,
    category: 'utilities',
    date: '2026-09-30',
    paymentMethod: 'transfer',
    notes: 'Monthly Gigabit broadband plan',
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
  },
  {
    id: 'exp-4',
    title: 'Cinema & Movie Tickets',
    amount: 34.5,
    category: 'entertainment',
    date: '2026-09-28',
    paymentMethod: 'digital_wallet',
    notes: 'Sci-fi premiere with drinks',
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
  },
  {
    id: 'exp-5',
    title: 'Pharmacy & Vitamin Supplements',
    amount: 42.15,
    category: 'health',
    date: '2026-09-26',
    paymentMethod: 'card',
    notes: 'Multivitamins and allergy medication',
    createdAt: Date.now() - 1000 * 60 * 60 * 120,
  },
  {
    id: 'exp-6',
    title: 'Desk Ergonomic Mouse & Pad',
    amount: 58.99,
    category: 'shopping',
    date: '2026-09-24',
    paymentMethod: 'card',
    notes: 'Home office ergonomic upgrade',
    createdAt: Date.now() - 1000 * 60 * 60 * 168,
  },
  {
    id: 'exp-7',
    title: 'Online Cloud Architecture Course',
    amount: 99.0,
    category: 'education',
    date: '2026-09-20',
    paymentMethod: 'digital_wallet',
    notes: 'Certification exam prep series',
    createdAt: Date.now() - 1000 * 60 * 60 * 240,
  },
  {
    id: 'exp-8',
    title: 'Artisan Coffee Roasters',
    amount: 14.8,
    category: 'food',
    date: '2026-09-18',
    paymentMethod: 'digital_wallet',
    notes: 'Single origin pour-over & pastry',
    createdAt: Date.now() - 1000 * 60 * 60 * 300,
  },
];
