'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from 'src/components/DashboardLayout';
import API from 'src/services/api';
import { Transaction, TransactionType, TransactionCategory } from 'src/types';
import { formatCurrency, formatDate, formatDateForInput } from 'src/utils';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  X,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [date, setDate] = useState('');

  const CATEGORIES: TransactionCategory[] = ['Food', 'Travel', 'Shopping', 'Bills', 'Salary', 'Others'];

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (typeFilter !== 'All') params.append('type', typeFilter);

      const response = await API.get(`/transactions?${params.toString()}`);
      setTransactions(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, typeFilter]);

  useEffect(() => {
    // Fetch transactions with a slight debounce on search
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchTransactions]);

  const openAddModal = () => {
    setEditingTransaction(null);
    setDescription('');
    setAmount('');
    setType('expense');
    setCategory('Food');
    setDate(formatDateForInput(new Date().toISOString()));
    setModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setDescription(tx.description);
    setAmount(tx.amount.toString());
    setType(tx.type);
    setCategory(tx.category);
    setDate(formatDateForInput(tx.date));
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(false);

    if (!description || !amount || !category || !date) {
      alert('Please fill in all fields');
      return;
    }

    const txAmount = parseFloat(amount);
    if (isNaN(txAmount) || txAmount <= 0) {
      alert('Please enter a valid amount greater than zero');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        description,
        amount: txAmount,
        type,
        category,
        date: new Date(date).toISOString()
      };

      if (editingTransaction) {
        // Edit transaction
        await API.put(`/transactions/${editingTransaction._id}`, payload);
      } else {
        // Add transaction
        await API.post('/transactions', payload);
      }

      setModalOpen(false);
      fetchTransactions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await API.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete transaction');
    }
  };

  return (
    <DashboardLayout title="Transactions">
      {/* Header section with add button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-sans">Manage Transactions</h2>
          <p className="text-slate-500 text-sm">Add, modify, or track your finances.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 transition duration-200 cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Add Transaction
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by description..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-950 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto md:ml-auto">
          {/* Type Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4.5 w-4.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-36 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-40 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 m-4 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {transactions.map((tx) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEditModal(tx)}
                          className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-slate-100 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-slate-100 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <p className="text-slate-400 text-sm font-medium">No transactions found matching the criteria.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-lg font-bold text-slate-950 mb-1">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </h3>
            <p className="text-slate-500 text-xs mb-6">
              {editingTransaction ? 'Update the details below' : 'Log a new cash outflow or inflow'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type selector tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2 text-sm font-semibold rounded-lg transition ${
                      type === 'expense'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TrendingDown className="h-4 w-4 inline mr-1" />
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 text-sm font-semibold rounded-lg transition ${
                      type === 'income'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Grocery shopping"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-sm placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Amount (INR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-sm font-semibold"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-sm"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2.5 text-white font-semibold rounded-xl text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer ${
                    type === 'income'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/10'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Transaction'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
