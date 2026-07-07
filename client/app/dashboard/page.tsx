'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from 'src/components/DashboardLayout';
import API from 'src/services/api';
import { Transaction, Budget } from 'src/types';
import { formatCurrency, formatDate } from 'src/utils';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  ArrowRight,
  PlusCircle,
  PiggyBank,
  Loader2
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<number>(0);
  const [currentMonthExpenses, setCurrentMonthExpenses] = useState<number>(0);

  const COLORS = ['#2563eb', '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];
  const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Salary', 'Others'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        // Fetch transactions
        const transRes = await API.get('/transactions');
        setTransactions(transRes.data.data);

        // Fetch budget
        const budgetRes = await API.get(`/budget?month=${currentMonth}&year=${currentYear}`);
        setBudget(budgetRes.data.data.budgetAmount || 0);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute metrics
  const totalBalance = transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const monthlyTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyExpense = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  // Sync state for remaining budget progress card
  useEffect(() => {
    setCurrentMonthExpenses(monthlyExpense);
  }, [monthlyExpense]);

  const remainingBudget = budget - currentMonthExpenses;
  const budgetProgress = budget > 0 ? Math.min((currentMonthExpenses / budget) * 100, 100) : 0;

  // Prepare Pie Chart Data (Category breakdown of monthly expenses)
  const pieData = CATEGORIES.map((cat) => {
    const value = monthlyTransactions
      .filter((t) => t.type === 'expense' && t.category === cat)
      .reduce((acc, t) => acc + t.amount, 0);
    return { name: cat, value };
  }).filter((item) => item.value > 0);

  // Prepare Bar Chart Data (Last 6 Months Income vs Expense)
  const getLast6MonthsData = () => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const monthName = d.toLocaleString('default', { month: 'short' });

      const filtered = transactions.filter((t) => {
        const transDate = new Date(t.date);
        return transDate.getMonth() + 1 === m && transDate.getFullYear() === y;
      });

      const income = filtered
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

      const expense = filtered
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

      data.push({
        name: monthName,
        Income: income,
        Expense: expense
      });
    }
    return data;
  };

  const barData = getLast6MonthsData();
  const recentTransactions = transactions.slice(0, 5);

  if (loading) {
    return (
      <DashboardLayout title="Overview">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Financial Overview">
      {/* Action Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Welcome back to FinSight!</h2>
          <p className="text-slate-500 text-sm">Here is a summary of your financial status for this month.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 transition duration-200"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Add Transaction
          </Link>
          <Link
            href="/budget"
            className="inline-flex items-center gap-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-200"
          >
            <PiggyBank className="h-4.5 w-4.5 text-slate-400" />
            Set Budget
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Balance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Balance</p>
            <h3 className={`text-2xl font-black mt-2 tracking-tight ${totalBalance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
              {formatCurrency(totalBalance)}
            </h3>
            <p className="text-xs text-slate-400 mt-2">Cumulative net balance</p>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
            <Wallet className="h-6 w-6" />
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Income This Month</p>
            <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
              {formatCurrency(monthlyIncome)}
            </h3>
            <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Incoming cashflow
            </p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Monthly Expense */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expenses This Month</p>
            <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
              {formatCurrency(monthlyExpense)}
            </h3>
            <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Outgoing cashflow
            </p>
          </div>
          <div className="bg-red-50 text-red-600 p-3 rounded-xl">
            <TrendingDown className="h-6 w-6" />
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remaining Budget</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                {budget > 0 ? formatCurrency(remainingBudget) : 'No Budget'}
              </h3>
            </div>
            <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
              <Calendar className="h-5.5 w-5.5" />
            </div>
          </div>
          {budget > 0 ? (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500">Usage Progress</span>
                <span className="font-semibold text-slate-700">{budgetProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    budgetProgress > 90
                      ? 'bg-red-600'
                      : budgetProgress > 75
                      ? 'bg-amber-500'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${budgetProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-1">
              <Link href="/budget" className="text-blue-600 hover:underline font-semibold">
                Set a budget
              </Link>{' '}
              to track monthly limit
            </p>
          )}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Income vs Expense Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-base font-bold text-slate-900 mb-6">Income vs Expenses (Last 6 Months)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  labelClassName="font-bold text-slate-800"
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="Expense" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Category-wise Spending</h3>
            <p className="text-slate-400 text-xs mb-6">Breakdown of this month's expenses</p>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-slate-400 font-medium">No expenses this month</p>
              </div>
            )}
          </div>
          {pieData.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs max-h-24 overflow-y-auto pr-1">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-slate-600 truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
          <Link
            href="/transactions"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All Transactions
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 truncate max-w-[200px]">{tx.description}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {tx.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm font-medium">No transactions recorded yet.</p>
            <Link
              href="/transactions"
              className="text-xs font-semibold text-blue-600 hover:underline mt-2 inline-block"
            >
              Log your first transaction now
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
