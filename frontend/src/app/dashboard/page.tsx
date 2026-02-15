"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import type { ExpenseSummary } from "@/lib/types";
import { fetchExpenseSummary } from "@/lib/api";

const DISPLAY_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR"];

const CATEGORY_COLORS: Record<string, string> = {
  food: "#22c55e",
  transport: "#3b82f6",
  bills: "#f59e0b",
  shopping: "#8b5cf6",
  other: "#6b7280",
};

export default function DashboardPage() {
  const [displayCurrency, setDisplayCurrency] = useState("USD");
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchExpenseSummary(displayCurrency)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [displayCurrency]);

  if (loading && !summary) return <p className="text-gray-500">Loading dashboard…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!summary) return <p className="text-gray-500">No data.</p>;

  const { totals, by_category, by_month, display_currency } = summary;
  const currency = display_currency || displayCurrency;
  const pieData = by_category.map((c) => ({
    name: c.category,
    value: Number(c.total),
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <label htmlFor="dashboard-currency" className="text-sm font-medium text-gray-700">
            Compare all in:
          </label>
          <select
            id="dashboard-currency"
            value={displayCurrency}
            onChange={(e) => setDisplayCurrency(e.target.value)}
            className="rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {DISPLAY_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <Link href="/" className="text-blue-600 hover:underline">
          View expenses
        </Link>
      </div>

      <p className="text-sm text-gray-500">
        All amounts below are shown in <strong>{currency}</strong>. Amounts in other currencies are converted using live exchange rates for fair comparison.
      </p>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Summary ({currency})</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Total spent</p>
            <p className="text-2xl font-bold">
              {totals.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Number of expenses</p>
            <p className="text-2xl font-bold">{totals.count}</p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Average</p>
            <p className="text-2xl font-bold">
              {totals.average.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Spending by category ({currency})</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 rounded-lg border bg-white p-4 shadow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={by_category.map((c) => ({ ...c, total: Number(c.total) }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(2)} ${currency}`, "Total"]} />
                <Bar dataKey="total" fill="#3b82f6" name={`Total (${currency})`} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-80 rounded-lg border bg-white p-4 shadow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toFixed(2)} ${currency}`, "Total"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Trend over time ({currency})</h2>
        <div className="h-80 rounded-lg border bg-white p-4 shadow">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={by_month.map((m) => ({
                ...m,
                total: Number(m.total),
                monthLabel: m.month.slice(0, 7),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" />
              <YAxis tickFormatter={(v) => v.toLocaleString()} />
              <Tooltip formatter={(value: number) => [`${value != null ? value.toFixed(2) : "—"} ${currency}`, "Total"]} />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" name={`Total (${currency})`} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
