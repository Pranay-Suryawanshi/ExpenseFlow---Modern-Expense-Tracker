import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// In-memory expense store matching Laravel schema
let serverExpenses: Array<{
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}> = [
  {
    id: 'exp-1',
    title: 'Whole Foods Market',
    amount: 86.45,
    category: 'food',
    date: '2026-10-02',
    payment_method: 'card',
    notes: 'Organic produce, berries, and pantry essentials',
    created_at: '2026-10-02T00:25:00.000Z',
    updated_at: '2026-10-02T00:25:00.000Z',
  },
  {
    id: 'exp-2',
    title: 'Metro Monthly Transit Pass',
    amount: 72.0,
    category: 'transport',
    date: '2026-10-01',
    payment_method: 'card',
    notes: 'Subway & bus unlimited for October',
    created_at: '2026-10-01T08:30:00.000Z',
    updated_at: '2026-10-01T08:30:00.000Z',
  },
  {
    id: 'exp-3',
    title: 'High-speed Fiber Internet',
    amount: 65.0,
    category: 'utilities',
    date: '2026-09-30',
    payment_method: 'transfer',
    notes: 'Monthly Gigabit broadband plan',
    created_at: '2026-09-30T10:15:00.000Z',
    updated_at: '2026-09-30T10:15:00.000Z',
  },
  {
    id: 'exp-4',
    title: 'Cinema & Movie Tickets',
    amount: 34.5,
    category: 'entertainment',
    date: '2026-09-28',
    payment_method: 'digital_wallet',
    notes: 'Sci-fi premiere with drinks',
    created_at: '2026-09-28T19:40:00.000Z',
    updated_at: '2026-09-28T19:40:00.000Z',
  },
  {
    id: 'exp-5',
    title: 'Pharmacy & Vitamin Supplements',
    amount: 42.15,
    category: 'health',
    date: '2026-09-26',
    payment_method: 'card',
    notes: 'Multivitamins and allergy medication',
    created_at: '2026-09-26T14:10:00.000Z',
    updated_at: '2026-09-26T14:10:00.000Z',
  },
  {
    id: 'exp-6',
    title: 'Desk Ergonomic Mouse & Pad',
    amount: 58.99,
    category: 'shopping',
    date: '2026-09-24',
    payment_method: 'card',
    notes: 'Home office ergonomic upgrade',
    created_at: '2026-09-24T16:05:00.000Z',
    updated_at: '2026-09-24T16:05:00.000Z',
  },
  {
    id: 'exp-7',
    title: 'Online Cloud Architecture Course',
    amount: 99.0,
    category: 'education',
    date: '2026-09-20',
    payment_method: 'digital_wallet',
    notes: 'Certification exam prep series',
    created_at: '2026-09-20T11:00:00.000Z',
    updated_at: '2026-09-20T11:00:00.000Z',
  },
  {
    id: 'exp-8',
    title: 'Artisan Coffee Roasters',
    amount: 14.8,
    category: 'food',
    date: '2026-09-18',
    payment_method: 'digital_wallet',
    notes: 'Single origin pour-over & pastry',
    created_at: '2026-09-18T09:12:00.000Z',
    updated_at: '2026-09-18T09:12:00.000Z',
  },
  {
    id: 'exp-9',
    title: 'Weekly Grocery Stock',
    amount: 112.3,
    category: 'food',
    date: '2026-08-22',
    payment_method: 'card',
    notes: 'Fresh veggies, fruit and dairy',
    created_at: '2026-08-22T10:00:00.000Z',
    updated_at: '2026-08-22T10:00:00.000Z',
  },
  {
    id: 'exp-10',
    title: 'Electric & Power Bill',
    amount: 88.5,
    category: 'utilities',
    date: '2026-08-15',
    payment_method: 'transfer',
    notes: 'Summer cooling cycle electricity',
    created_at: '2026-08-15T12:00:00.000Z',
    updated_at: '2026-08-15T12:00:00.000Z',
  },
  {
    id: 'exp-11',
    title: 'Concert Tickets',
    amount: 120.0,
    category: 'entertainment',
    date: '2026-07-19',
    payment_method: 'card',
    notes: 'Summer festival live stage',
    created_at: '2026-07-19T20:00:00.000Z',
    updated_at: '2026-07-19T20:00:00.000Z',
  },
  {
    id: 'exp-12',
    title: 'Bookstore & Tech Journal',
    amount: 45.0,
    category: 'education',
    date: '2026-06-11',
    payment_method: 'card',
    notes: 'Design patterns and distributed systems',
    created_at: '2026-06-11T15:30:00.000Z',
    updated_at: '2026-06-11T15:30:00.000Z',
  },
];

function laravelApiPlugin(): Plugin {
  return {
    name: 'laravel-rest-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Only intercept /api/* routes
        if (!req.url?.startsWith('/api')) {
          return next();
        }

        // Set standard Laravel JSON Response headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
        res.setHeader('X-Powered-By', 'Laravel/11.x (REST API)');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }

        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname;

        // Health check endpoint
        if (pathname === '/api/health') {
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              status: 'healthy',
              message: 'Laravel REST API service active',
              version: '11.2.0',
              timestamp: new Date().toISOString(),
            })
          );
        }

        // Helper to parse JSON body
        const readBody = (callback: (body: any) => void) => {
          let data = '';
          req.on('data', (chunk) => {
            data += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = data ? JSON.parse(data) : {};
              callback(parsed);
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ message: 'Malformed JSON payload' }));
            }
          });
        };

        // GET /api/expenses
        if (pathname === '/api/expenses' && req.method === 'GET') {
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              data: serverExpenses,
              meta: {
                total: serverExpenses.length,
                timestamp: new Date().toISOString(),
              },
            })
          );
        }

        // POST /api/expenses
        if (pathname === '/api/expenses' && req.method === 'POST') {
          return readBody((body) => {
            // Laravel FormRequest validation simulation
            const errors: Record<string, string[]> = {};
            if (!body.title) errors.title = ['The title field is required.'];
            if (body.amount === undefined || isNaN(Number(body.amount)) || Number(body.amount) <= 0) {
              errors.amount = ['The amount must be a number greater than 0.'];
            }
            if (!body.category) errors.category = ['The category field is required.'];
            if (!body.date) errors.date = ['The date field is required.'];

            if (Object.keys(errors).length > 0) {
              res.statusCode = 422;
              return res.end(
                JSON.stringify({
                  message: 'The given data was invalid.',
                  errors,
                })
              );
            }

            const now = new Date().toISOString();
            const newExpense = {
              id: body.id || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              title: String(body.title).trim(),
              amount: Math.round(Number(body.amount) * 100) / 100,
              category: String(body.category),
              date: String(body.date),
              payment_method: String(body.payment_method || 'card'),
              notes: body.notes ? String(body.notes).trim() : null,
              created_at: now,
              updated_at: now,
            };

            serverExpenses = [newExpense, ...serverExpenses];
            res.statusCode = 201;
            return res.end(
              JSON.stringify({
                data: newExpense,
                message: 'Expense created successfully.',
              })
            );
          });
        }

        // PUT/PATCH /api/expenses/:id
        const expenseIdMatch = pathname.match(/^\/api\/expenses\/([^/]+)$/);
        if (expenseIdMatch && (req.method === 'PUT' || req.method === 'PATCH')) {
          const expenseId = expenseIdMatch[1];
          return readBody((body) => {
            const index = serverExpenses.findIndex((e) => e.id === expenseId);
            if (index === -1) {
              res.statusCode = 404;
              return res.end(
                JSON.stringify({
                  message: `Expense with id '${expenseId}' not found.`,
                })
              );
            }

            const existing = serverExpenses[index];
            const updated = {
              ...existing,
              title: body.title !== undefined ? String(body.title).trim() : existing.title,
              amount: body.amount !== undefined ? Math.round(Number(body.amount) * 100) / 100 : existing.amount,
              category: body.category !== undefined ? String(body.category) : existing.category,
              date: body.date !== undefined ? String(body.date) : existing.date,
              payment_method: body.payment_method !== undefined ? String(body.payment_method) : existing.payment_method,
              notes: body.notes !== undefined ? (body.notes ? String(body.notes).trim() : null) : existing.notes,
              updated_at: new Date().toISOString(),
            };

            serverExpenses[index] = updated;
            res.statusCode = 200;
            return res.end(
              JSON.stringify({
                data: updated,
                message: 'Expense updated successfully.',
              })
            );
          });
        }

        // DELETE /api/expenses/:id
        if (expenseIdMatch && req.method === 'DELETE') {
          const expenseId = expenseIdMatch[1];
          const index = serverExpenses.findIndex((e) => e.id === expenseId);
          if (index === -1) {
            res.statusCode = 404;
            return res.end(
              JSON.stringify({
                message: `Expense with id '${expenseId}' not found.`,
              })
            );
          }

          serverExpenses.splice(index, 1);
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              message: 'Expense deleted successfully.',
            })
          );
        }

        // Fallthrough for unmatched /api routes
        res.statusCode = 404;
        res.end(
          JSON.stringify({
            message: 'Endpoint not found on Laravel REST API.',
          })
        );
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), laravelApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

