import React, { useState } from 'react';
import { X, Check, Server, RefreshCw, Copy, CheckCheck, Terminal, AlertCircle, ShieldCheck, ExternalLink } from 'lucide-react';
import { ApiConfig, getApiConfig, saveApiConfig, laravelApi } from '../services/laravelApi';

interface LaravelApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncData: () => Promise<void>;
  isSyncing: boolean;
}

export const LaravelApiModal: React.FC<LaravelApiModalProps> = ({
  isOpen,
  onClose,
  onSyncData,
  isSyncing,
}) => {
  const [activeTab, setActiveTab] = useState<'connection' | 'code'>('connection');
  const [config, setConfig] = useState<ApiConfig>(getApiConfig());
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    status: number;
    message: string;
    latencyMs: number;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    saveApiConfig(config);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    handleSave();
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await laravelApi.testConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        ok: false,
        status: 0,
        message: err.message || 'Connection failed',
        latencyMs: 0,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const migrationCode = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->decimal('amount', 12, 2);
            $table->string('category');
            $table->date('date');
            $table->string('payment_method')->default('card');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};`;

  const modelCode = `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;

class Expense extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'title',
        'amount',
        'category',
        'date',
        'payment_method',
        'notes',
    ];

    protected $casts = [
        'amount' => 'float',
        'date' => 'date:Y-m-d',
    ];
}`;

  const controllerCode = `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Models\\Expense;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Str;

class ExpenseController extends Controller
{
    public function index()
    {
        $expenses = Expense::orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $expenses,
            'meta' => ['total' => $expenses->count()]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'category' => 'required|string',
            'date' => 'required|date',
            'payment_method' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $validated['id'] = $request->input('id', 'exp-' . Str::uuid());

        $expense = Expense::create($validated);

        return response()->json([
            'data' => $expense,
            'message' => 'Expense created successfully'
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $expense = Expense::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'amount' => 'sometimes|required|numeric|min:0.01',
            'category' => 'sometimes|required|string',
            'date' => 'sometimes|required|date',
            'payment_method' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $expense->update($validated);

        return response()->json([
            'data' => $expense,
            'message' => 'Expense updated successfully'
        ]);
    }

    public function destroy(string $id)
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();

        return response()->json([
            'message' => 'Expense deleted successfully'
        ], 200);
    }
}`;

  const routesCode = `<?php

use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\Api\\ExpenseController;

Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'framework' => 'Laravel ' . app()->version(),
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::apiResource('expenses', ExpenseController::class);`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden transition-all flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Laravel REST API Integration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Connect to a Laravel 10/11 REST backend or test with the built-in REST mock service
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 px-6 gap-6 shrink-0 bg-white">
          <button
            onClick={() => setActiveTab('connection')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'connection'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Connection Settings
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Laravel Backend Code (Controller & Migration)
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'connection' ? (
            <>
              {/* Connection Status Box */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Standard REST Endpoints Active
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Target:{' '}
                      <code className="text-slate-700 font-mono font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {config.baseUrl}
                      </code>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Pinging...' : 'Test Connection'}</span>
                </button>
              </div>

              {/* Test Result Feedback */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-lg border text-xs flex items-center gap-2.5 ${
                    testResult.ok
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50/70 border-rose-200 text-rose-800'
                  }`}
                >
                  {testResult.ok ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <div className="flex-1">
                    <span className="font-semibold">{testResult.message}</span>
                    {testResult.ok && (
                      <span className="ml-2 font-mono text-[11px] text-emerald-700">
                        (Status: {testResult.status} OK · Latency: {testResult.latencyMs}ms)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Configuration Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Laravel API Base URL
                  </label>
                  <input
                    type="text"
                    value={config.baseUrl}
                    onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                    placeholder="/api or http://127.0.0.1:8000/api"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                    <span>Quick presets:</span>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, baseUrl: '/api' })}
                      className="text-emerald-600 hover:underline font-mono text-[11px] cursor-pointer"
                    >
                      /api (Internal Dev Service)
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, baseUrl: 'http://127.0.0.1:8000/api' })}
                      className="text-emerald-600 hover:underline font-mono text-[11px] cursor-pointer"
                    >
                      http://127.0.0.1:8000/api (Local Laravel Artisan)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Sanctum / Bearer Token (Optional)
                  </label>
                  <input
                    type="password"
                    value={config.bearerToken}
                    onChange={(e) => setConfig({ ...config, bearerToken: e.target.value })}
                    placeholder="1|laravel_sanctum_personal_access_token..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sent via <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">Authorization: Bearer &lt;token&gt;</code> header on every request.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={async () => {
                    handleSave();
                    await onSyncData();
                  }}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Expenses from API'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSave();
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Save & Apply Settings
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 leading-relaxed">
                <p className="font-bold text-slate-900 mb-1">
                  Laravel REST API Blueprint
                </p>
                To connect your local or production Laravel application, run{' '}
                <code className="bg-white border px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">
                  php artisan make:model Expense -mcr
                </code>{' '}
                and use the matching files below.
              </div>

              {/* 1. Routes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    routes/api.php
                  </span>
                  <button
                    onClick={() => handleCopy('routes', routesCode)}
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
                  >
                    {copiedKey === 'routes' ? (
                      <CheckCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'routes' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">
                  {routesCode}
                </pre>
              </div>

              {/* 2. Controller */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    app/Http/Controllers/Api/ExpenseController.php
                  </span>
                  <button
                    onClick={() => handleCopy('controller', controllerCode)}
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
                  >
                    {copiedKey === 'controller' ? (
                      <CheckCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'controller' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto max-h-56">
                  {controllerCode}
                </pre>
              </div>

              {/* 3. Migration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    database/migrations/..._create_expenses_table.php
                  </span>
                  <button
                    onClick={() => handleCopy('migration', migrationCode)}
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
                  >
                    {copiedKey === 'migration' ? (
                      <CheckCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'migration' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">
                  {migrationCode}
                </pre>
              </div>

              {/* 4. Model */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    app/Models/Expense.php
                  </span>
                  <button
                    onClick={() => handleCopy('model', modelCode)}
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
                  >
                    {copiedKey === 'model' ? (
                      <CheckCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'model' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">
                  {modelCode}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
