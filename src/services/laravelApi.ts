import { Expense, CategoryId, PaymentMethod } from '../types';

export interface LaravelExpensePayload {
  id?: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  payment_method: string;
  notes?: string | null;
}

export interface LaravelExpenseResponse {
  id: string | number;
  title: string;
  amount: number | string;
  category: string;
  date: string;
  payment_method?: string;
  paymentMethod?: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiConfig {
  baseUrl: string;
  bearerToken: string;
  isExternal: boolean;
}

const STORAGE_KEY_API_CONFIG = 'expenseflow_laravel_api_config_v1';

// Default config: uses local /api mock middleware
const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: (import.meta.env.VITE_LARAVEL_API_URL as string) || '/api',
  bearerToken: '',
  isExternal: false,
};

export function getApiConfig(): ApiConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_API_CONFIG);
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_CONFIG;
}

export function saveApiConfig(config: ApiConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_API_CONFIG, JSON.stringify(config));
  } catch {
    // ignore
  }
}

/**
 * Normalizes a Laravel REST API expense object to the frontend Expense interface
 */
export function mapFromLaravel(item: LaravelExpenseResponse): Expense {
  return {
    id: String(item.id),
    title: item.title,
    amount: Number(item.amount),
    category: (item.category as CategoryId) || 'other',
    date: item.date,
    paymentMethod: ((item.payment_method || item.paymentMethod) as PaymentMethod) || 'card',
    notes: item.notes || undefined,
    createdAt: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
  };
}

/**
 * Maps frontend Expense to standard Laravel database column format
 */
export function mapToLaravel(expense: Omit<Expense, 'id' | 'createdAt'> & { id?: string }): LaravelExpensePayload {
  return {
    id: expense.id,
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    payment_method: expense.paymentMethod,
    notes: expense.notes || null,
  };
}

class LaravelApiService {
  private getHeaders(): HeadersInit {
    const config = getApiConfig();
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    if (config.bearerToken.trim()) {
      headers['Authorization'] = `Bearer ${config.bearerToken.trim()}`;
    }

    return headers;
  }

  private cleanUrl(endpoint: string): string {
    const config = getApiConfig();
    let base = config.baseUrl.trim();
    if (base.endsWith('/')) {
      base = base.slice(0, -1);
    }
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${cleanEndpoint}`;
  }

  /**
   * Ping / test the Laravel API connection
   */
  async testConnection(): Promise<{ ok: boolean; status: number; message: string; latencyMs: number }> {
    const startTime = performance.now();
    try {
      const url = this.cleanUrl('/health');
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const latencyMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        return {
          ok: true,
          status: response.status,
          message: `Connection successful (${latencyMs}ms)`,
          latencyMs,
        };
      }

      // If /health not implemented on their Laravel app, try /expenses
      const altUrl = this.cleanUrl('/expenses');
      const altResponse = await fetch(altUrl, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const altLatency = Math.round(performance.now() - startTime);

      if (altResponse.ok) {
        return {
          ok: true,
          status: altResponse.status,
          message: `Laravel API reachable (${altLatency}ms)`,
          latencyMs: altLatency,
        };
      }

      return {
        ok: false,
        status: response.status,
        message: `HTTP ${response.status}: ${response.statusText}`,
        latencyMs,
      };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        ok: false,
        status: 0,
        message: err.message || 'Network connection failed (Check CORS or server status)',
        latencyMs,
      };
    }
  }

  /**
   * Fetch all expenses: GET /api/expenses
   */
  async fetchExpenses(): Promise<Expense[]> {
    const url = this.cleanUrl('/expenses');
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch expenses from Laravel API (HTTP ${response.status})`);
    }

    const json = await response.json();
    // Laravel Resource collections wrap items in 'data'
    const list: LaravelExpenseResponse[] = Array.isArray(json)
      ? json
      : Array.isArray(json.data)
      ? json.data
      : [];

    return list.map(mapFromLaravel);
  }

  /**
   * Create an expense: POST /api/expenses
   */
  async createExpense(data: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const url = this.cleanUrl('/expenses');
    const payload = mapToLaravel(data);

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (response.status === 422) {
      const errorJson = await response.json();
      const firstError = errorJson.errors
        ? Object.values(errorJson.errors).flat()[0]
        : errorJson.message;
      throw new Error(String(firstError || 'Validation error from Laravel API'));
    }

    if (!response.ok) {
      throw new Error(`Failed to create expense (HTTP ${response.status})`);
    }

    const json = await response.json();
    const createdItem = json.data || json;
    return mapFromLaravel(createdItem);
  }

  /**
   * Update an expense: PUT /api/expenses/{id}
   */
  async updateExpense(id: string, data: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const url = this.cleanUrl(`/expenses/${id}`);
    const payload = mapToLaravel(data);

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (response.status === 422) {
      const errorJson = await response.json();
      const firstError = errorJson.errors
        ? Object.values(errorJson.errors).flat()[0]
        : errorJson.message;
      throw new Error(String(firstError || 'Validation error from Laravel API'));
    }

    if (!response.ok) {
      throw new Error(`Failed to update expense (HTTP ${response.status})`);
    }

    const json = await response.json();
    const updatedItem = json.data || json;
    return mapFromLaravel(updatedItem);
  }

  /**
   * Delete an expense: DELETE /api/expenses/{id}
   */
  async deleteExpense(id: string): Promise<boolean> {
    const url = this.cleanUrl(`/expenses/${id}`);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok && response.status !== 204 && response.status !== 200) {
      throw new Error(`Failed to delete expense from Laravel API (HTTP ${response.status})`);
    }

    return true;
  }
}

export const laravelApi = new LaravelApiService();
