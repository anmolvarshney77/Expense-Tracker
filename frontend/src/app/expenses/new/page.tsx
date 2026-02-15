"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import ExpenseForm from "@/components/ExpenseForm";
import { createExpense } from "@/lib/api";

export default function NewExpensePage() {
  const router = useRouter();

  const handleSubmit = async (data: Parameters<typeof createExpense>[0]) => {
    await createExpense(data);
    router.push("/");
  };

  return (
    <div>
      <Link href="/" className="mb-4 inline-block text-blue-600 hover:underline">
        ← Back to list
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Add expense</h1>
      <ExpenseForm onSubmit={handleSubmit} submitLabel="Create expense" />
    </div>
  );
}
