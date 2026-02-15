"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Expense } from "@/lib/types";
import ExpenseForm from "@/components/ExpenseForm";
import { fetchExpense, updateExpense } from "@/lib/api";

export default function EditExpensePage() {
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

  const handleSubmit = async (data: Parameters<typeof updateExpense>[1]) => {
    await updateExpense(id, data);
    router.push(`/expenses/${id}`);
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!expense) return <p className="text-gray-500">Expense not found.</p>;

  return (
    <div>
      <Link href={`/expenses/${id}`} className="mb-4 inline-block text-blue-600 hover:underline">
        ← Back to expense
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Edit expense</h1>
      <ExpenseForm initial={expense} onSubmit={handleSubmit} />
    </div>
  );
}
