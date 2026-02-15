"use client";

import type { Expense, ExpenseCreate } from "@/lib/types";

const CATEGORIES: ExpenseCreate["category"][] = [
  "food",
  "transport",
  "bills",
  "shopping",
  "other",
];
const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR"];

interface ExpenseFormProps {
  initial?: Expense | null;
  onSubmit: (data: ExpenseCreate) => Promise<void>;
  submitLabel?: string;
}

export default function ExpenseForm({
  initial,
  onSubmit,
  submitLabel = "Save",
}: ExpenseFormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data: ExpenseCreate = {
      amount: (form.querySelector('[name="amount"]') as HTMLInputElement).value,
      currency: (form.querySelector('[name="currency"]') as HTMLSelectElement).value,
      category: (form.querySelector('[name="category"]') as HTMLSelectElement)
        .value as ExpenseCreate["category"],
      date: (form.querySelector('[name="date"]') as HTMLInputElement).value,
      description: (form.querySelector('[name="description"]') as HTMLInputElement).value || undefined,
      merchant: (form.querySelector('[name="merchant"]') as HTMLInputElement).value || undefined,
    };
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <label htmlFor="amount" className="mb-1 block text-sm font-medium">
          Amount *
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          required
          defaultValue={initial?.amount}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="currency" className="mb-1 block text-sm font-medium">
          Currency
        </label>
        <select
          id="currency"
          name="currency"
          className="w-full rounded border border-gray-300 px-3 py-2"
          defaultValue={initial?.currency || "USD"}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium">
          Category *
        </label>
        <select
          id="category"
          name="category"
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
          defaultValue={initial?.category}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="date" className="mb-1 block text-sm font-medium">
          Date *
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={initial?.date}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="merchant" className="mb-1 block text-sm font-medium">
          Merchant
        </label>
        <input
          id="merchant"
          name="merchant"
          type="text"
          defaultValue={initial?.merchant}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Description
        </label>
        <input
          id="description"
          name="description"
          type="text"
          defaultValue={initial?.description}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        {submitLabel}
      </button>
    </form>
  );
}
