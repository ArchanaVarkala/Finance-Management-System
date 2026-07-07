'use client';

import Link from 'next/link';
import { ArrowRight, Wallet, PieChart, TrendingUp, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-md shadow-blue-500/20">
            <Wallet className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            Fin<span className="text-blue-600 font-extrabold">Sight</span>
          </span>
        </div>
        <nav className="flex items-center space-x-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-200"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto text-center">
          <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30">
            <div className="w-[500px] h-[500px] bg-blue-400 rounded-full blur-[120px]" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/50 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Your Smart Personal Finance Assistant
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight max-w-4xl mx-auto">
            Master Your Money.<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
              Simplify Your Life.
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mt-6 leading-relaxed">
            Take complete control of your finances. Track income, manage monthly budgets, and analyze category-wise spending with a modern, professional, and intuitive interface.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-slate-700 border border-slate-200 px-8 py-3.5 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="bg-slate-100/50 border-t border-b border-slate-200/60 py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Everything you need to succeed financially
              </h2>
              <p className="text-slate-600 mt-4 leading-relaxed">
                Simple tools designed to give you clarity and power over your financial habits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition duration-300">
                <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Income & Expense Tracking</h3>
                <p className="text-slate-600 mt-3 leading-relaxed">
                  Log your cashflow effortlessly. View transactions categorized for food, shopping, travel, bills, salary, and more.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition duration-300">
                <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <PieChart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Category Analytics</h3>
                <p className="text-slate-600 mt-3 leading-relaxed">
                  Visualize spending with interactive category pie charts and monthly comparison bar charts, powered by Recharts.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition duration-300">
                <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Budget Guardrails</h3>
                <p className="text-slate-600 mt-3 leading-relaxed">
                  Set target monthly budgets. Track real-time progress, calculate remaining funds, and prevent overspending.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Visual Promo */}
        <section className="py-20 px-6 max-w-7xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-8 md:p-16 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />
            <div className="max-w-2xl mx-auto relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Ready to transform your financial life?
              </h2>
              <p className="text-blue-100 mt-4 leading-relaxed">
                Join thousands of users tracking their way to financial freedom. Sign up now and get started with your personal FinSight dashboard in seconds.
              </p>
              <div className="mt-8">
                <Link
                  href="/signup"
                  className="bg-white text-blue-700 hover:bg-slate-50 px-8 py-3.5 rounded-xl font-bold shadow-md hover:-translate-y-0.5 transition-all duration-200 inline-block"
                >
                  Create Your Free Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2 text-white">
            <Wallet className="h-5 w-5 text-blue-500" />
            <span className="font-bold tracking-tight text-lg">
              Fin<span className="text-blue-500 font-extrabold">Sight</span>
            </span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} FinSight. Built as a B.Tech Final Year Project. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
