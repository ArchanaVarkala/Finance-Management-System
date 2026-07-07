'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from 'src/components/DashboardLayout';
import API from 'src/services/api';
import { formatCurrency, getMonthName } from 'src/utils';
import {
  PiggyBank,
  TrendingDown,
  CalendarCheck,
  AlertTriangle,
  Loader2,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function BudgetPage() {
  const [loading, setLoading] = useState(true);
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [remaining, setRemaining] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  // Month and Year selection
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [year, setYear] = useState<number>(today.getFullYear());

  // Input state
  const [inputAmount, setInputAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchBudget = useCallback(async () => {
    try {
      setLoading(true);
      setSuccessMsg(null);
      const response = await API.get(`/budget?month=${month}&year=${year}`);
      const data = response.data.data;
      setBudgetAmount(data.budgetAmount || 0);
      setTotalExpense(data.totalExpense || 0);
      setRemaining(data.remaining || 0);
      setProgress(data.progress || 0);
      setInputAmount(data.budgetAmount ? data.budgetAmount.toString() : '');
    } catch (error) {
      console.error('Error fetching budget:', error);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    const amountNum = parseFloat(inputAmount);
    if (isNaN(amountNum) || amountNum < 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    try {
      setSaving(true);
      await API.post('/budget', {
        amount: amountNum,
        month,
        year
      });
      setSuccessMsg('Budget updated successfully!');
      fetchBudget();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update budget');
    } finally {
      setSaving(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i); // 2 years back to 2 years forward

  return (
    <DashboardLayout title="Monthly Budget">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-sans">Budget Planner</h2>
          <p className="text-slate-500 text-sm">Monitor your monthly limits and control spending habits.</p>
        </div>

        {/* Date Selectors */}
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="flex-grow sm:w-32 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {getMonthName(m)}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="flex-grow sm:w-28 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: set budget form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Set Budget Target</h3>
              <p className="text-slate-500 text-xs mb-6">
                Specify your spending limit for {getMonthName(month)} {year}.
              </p>

              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 mb-4 text-xs font-semibold">
                  <CheckCircle className="h-4.5 w-4.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Budget Limit Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    placeholder="e.g. 25000"
                    required
                    min="0"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-sm font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving Budget...
                    </>
                  ) : (
                    'Set Monthly Budget'
                  )}
                </button>
              </form>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Budgets are locked per calendar month. Setting a budget helps you automatically monitor progress bars and receive warning prompts if your cash outflow reaches critical thresholds.
              </p>
            </div>
          </div>

          {/* Right panel: Budget calculations & status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status alerts */}
            {budgetAmount > 0 && progress >= 100 && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3.5 shadow-sm">
                <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5 text-red-600 animate-pulse" />
                <div>
                  <h4 className="font-bold text-sm">Budget Limit Exceeded!</h4>
                  <p className="text-xs text-red-600/90 mt-1 leading-relaxed">
                    You have exceeded your budgeted limit of {formatCurrency(budgetAmount)} by{' '}
                    <span className="font-bold">{formatCurrency(totalExpense - budgetAmount)}</span>.
                    Try postponing non-essential expenses.
                  </p>
                </div>
              </div>
            )}

            {budgetAmount > 0 && progress >= 75 && progress < 100 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-2xl flex items-start gap-3.5 shadow-sm">
                <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <h4 className="font-bold text-sm">接近预算限额 (Nearing Budget Limit)</h4>
                  <p className="text-xs text-amber-600/90 mt-1 leading-relaxed">
                    Caution: You have utilized <span className="font-bold">{progress.toFixed(0)}%</span> of your
                    monthly budget limit. Only {formatCurrency(remaining)} remains for {getMonthName(month)}.
                  </p>
                </div>
              </div>
            )}

            {/* Calculations layout cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Card 1: target */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Budget</p>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  {budgetAmount > 0 ? formatCurrency(budgetAmount) : 'Not Set'}
                </h4>
                <div className="flex items-center gap-1 text-slate-400 text-xs mt-2.5">
                  <CalendarCheck className="h-4 w-4 shrink-0" />
                  <span>{getMonthName(month)} {year}</span>
                </div>
              </div>

              {/* Card 2: expense */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Expenses</p>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(totalExpense)}
                </h4>
                <div className="flex items-center gap-1 text-red-500 text-xs mt-2.5">
                  <TrendingDown className="h-4 w-4 shrink-0" />
                  <span>Spent this month</span>
                </div>
              </div>

              {/* Card 3: remaining */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Remaining Funds</p>
                <h4 className={`text-xl font-black tracking-tight ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {budgetAmount > 0 ? formatCurrency(remaining) : 'N/A'}
                </h4>
                <div className="flex items-center gap-1 text-slate-400 text-xs mt-2.5">
                  <PiggyBank className="h-4 w-4 shrink-0" />
                  <span>{remaining >= 0 ? 'Savings left' : 'Deficit'}</span>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Monthly Budget Progress</h3>
                <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {progress.toFixed(1)}% Used
                </span>
              </div>

              {budgetAmount > 0 ? (
                <div>
                  <div className="w-full bg-slate-100 rounded-full h-4 mb-4">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        progress >= 100
                          ? 'bg-red-600 shadow-sm shadow-red-500/20'
                          : progress >= 75
                          ? 'bg-amber-500 shadow-sm shadow-amber-500/20'
                          : 'bg-blue-600 shadow-sm shadow-blue-500/20'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>₹0.00 spent</span>
                    <span>Limit: {formatCurrency(budgetAmount)}</span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <PiggyBank className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 font-medium">Please set a budget limit to track progress bars.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
