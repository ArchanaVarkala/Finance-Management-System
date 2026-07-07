'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from 'src/components/DashboardLayout';
import API from 'src/services/api';
import { Transaction, TransactionCategory } from 'src/types';
import { formatCurrency, getMonthName } from 'src/utils';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Coins,
  Loader2,
  CalendarDays
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LineChart,
  Line
} from 'recharts';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Month and Year selection filters
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [year, setYear] = useState<number>(today.getFullYear());

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await API.get('/transactions');
        setTransactions(response.data.data);
      } catch (error) {
        console.error('Error fetching transactions for reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i);

  // Filter transactions for the selected month and year
  const filteredTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  // Calculate Metrics
  const incomeTransactions = filteredTransactions.filter((t) => t.type === 'income');
  const expenseTransactions = filteredTransactions.filter((t) => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max((netSavings / totalIncome) * 100, 0) : 0;

  // 1. Prepare Category-wise Bar Chart Data
  const CATEGORIES: TransactionCategory[] = ['Food', 'Travel', 'Shopping', 'Bills', 'Salary', 'Others'];
  const COLORS = ['#2563eb', '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];

  const categoryData = CATEGORIES.map((cat) => {
    const amount = expenseTransactions
      .filter((t) => t.category === cat)
      .reduce((acc, t) => acc + t.amount, 0);
    return { name: cat, amount };
  }).filter((item) => item.amount > 0);

  // 2. Prepare Daily Spending Line Chart Data (1 to 31 days)
  const getDailyData = () => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const data = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayExpense = expenseTransactions
        .filter((t) => new Date(t.date).getDate() === day)
        .reduce((acc, t) => acc + t.amount, 0);
      data.push({
        day: day.toString(),
        Expense: dayExpense
      });
    }
    return data;
  };

  const dailyData = getDailyData();

  // 3. Category Summary Table
  const tableData = CATEGORIES.map((cat) => {
    const catExpenses = expenseTransactions.filter((t) => t.category === cat);
    const amount = catExpenses.reduce((acc, t) => acc + t.amount, 0);
    const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
    return {
      name: cat,
      amount,
      percentage,
      count: catExpenses.length
    };
  })
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <DashboardLayout title="Financial Reports">
      {/* Date Selectors */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-sans">Monthly Statements</h2>
          <p className="text-slate-500 text-sm">Deep-dive analysis of your monthly cash flow.</p>
        </div>

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
        <div className="space-y-8">
          {/* Summary Figures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Income */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Income</p>
                <h3 className="text-xl font-black text-slate-950 mt-1.5">{formatCurrency(totalIncome)}</h3>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-2">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  Inflows
                </span>
              </div>
              <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
                <TrendingUp className="h-5.5 w-5.5" />
              </div>
            </div>

            {/* Expense */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Expenses</p>
                <h3 className="text-xl font-black text-slate-955 mt-1.5">{formatCurrency(totalExpense)}</h3>
                <span className="inline-flex items-center text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md mt-2">
                  <TrendingDown className="h-3 w-3 mr-0.5" />
                  Outflows
                </span>
              </div>
              <div className="bg-red-50 text-red-600 p-2.5 rounded-xl">
                <TrendingDown className="h-5.5 w-5.5" />
              </div>
            </div>

            {/* Net Savings */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Savings</p>
                <h3 className={`text-xl font-black mt-1.5 ${netSavings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(netSavings)}
                </h3>
                <span className="inline-flex items-center text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-2">
                  <Coins className="h-3 w-3 mr-0.5" />
                  Net Savings
                </span>
              </div>
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                <Coins className="h-5.5 w-5.5" />
              </div>
            </div>

            {/* Savings Rate */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Savings Rate</p>
                <h3 className="text-xl font-black text-slate-950 mt-1.5">{savingsRate.toFixed(1)}%</h3>
                <span className="inline-flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mt-2">
                  <Percent className="h-3 w-3 mr-0.5" />
                  Rate
                </span>
              </div>
              <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
                <Percent className="h-5.5 w-5.5" />
              </div>
            </div>
          </div>

          {/* Charts Layout */}
          {filteredTransactions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily spending trends */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-6">Daily Spending Trend</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line
                        type="monotone"
                        dataKey="Expense"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category-wise Spending */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-6">Spending by Category</h3>
                <div className="h-72 w-full">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={70} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={16}>
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">
                      No expense records.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
              <CalendarDays className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">No transactions found for {getMonthName(month)} {year}</p>
              <p className="text-slate-400 text-xs mt-1">Please select another month or add transactions to view reports.</p>
            </div>
          )}

          {/* Detailed summary breakdown table */}
          {filteredTransactions.length > 0 && tableData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Category Expense Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Transactions Count</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Percentage of Total</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {tableData.map((row, index) => (
                      <tr key={row.name} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 flex items-center gap-2.5">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-bold text-slate-900">{row.name}</span>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 font-semibold">{row.count}</td>
                        <td className="px-6 py-4 text-right text-slate-500 font-medium">{row.percentage.toFixed(1)}%</td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">{formatCurrency(row.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
