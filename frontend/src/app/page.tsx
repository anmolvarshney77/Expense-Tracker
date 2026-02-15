"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Expense } from "@/lib/types";
import { fetchExpenses, deleteExpense } from "@/lib/api";

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchExpenses();
      setExpenses(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  if (loading) return <p className="text-gray-500">Loading expenses…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Link
          href="/expenses/new"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add expense
        </Link>
      </div>
      {expenses.length === 0 ? (
        <p className="text-gray-500">No expenses yet. Add one to get started.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white shadow">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Merchant</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{exp.date}</td>
                  <td className="px-4 py-3">
                    {exp.amount} {exp.currency}
                  </td>
                  <td className="px-4 py-3 capitalize">{exp.category}</td>
                  <td className="px-4 py-3">{exp.merchant || "—"}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/expenses/${exp.id}`}
                      className="mr-3 text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/expenses/${exp.id}/edit`}
                      className="mr-3 text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(exp.id, e)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
