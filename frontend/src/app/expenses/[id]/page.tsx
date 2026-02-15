"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Expense } from "@/lib/types";
import { fetchExpense, deleteExpense } from "@/lib/api";

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchExpense(id)
      .then((data) => {
        if (!cancelled) setExpense(data);
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
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      router.push("/");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!expense) return <p className="text-gray-500">Expense not found.</p>;

  return (
    <div className="max-w-xl">
      <div className="mb-4 flex items-center gap-4">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to list
        </Link>
        <Link
          href={`/expenses/${id}/edit`}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
      <div className="rounded-lg border bg-white p-6 shadow">
        <h1 className="mb-4 text-xl font-bold">
          {expense.amount} {expense.currency}
        </h1>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm text-gray-500">Category</dt>
            <dd className="capitalize">{expense.category}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Date</dt>
            <dd>{expense.date}</dd>
          </div>
          {expense.merchant && (
            <div>
              <dt className="text-sm text-gray-500">Merchant</dt>
              <dd>{expense.merchant}</dd>
            </div>
          )}
          {expense.description && (
            <div>
              <dt className="text-sm text-gray-500">Description</dt>
              <dd>{expense.description}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
