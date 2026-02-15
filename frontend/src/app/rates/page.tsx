"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchExchangeRate } from "@/lib/api";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR"];

export default function RatesPage() {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRate = async () => {
    setLoading(true);
    setError(null);
    setRate(null);
    try {
      const res = await fetchExchangeRate(from, to);
      setRate(res.rate);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch rate");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRate();
  }, []);

  return (
    <div className="max-w-xl">
      <Link href="/" className="mb-4 inline-block text-blue-600 hover:underline">
        ← Back to expenses
      </Link>
      <h1 className="mb-2 text-2xl font-bold">Live exchange rates</h1>
      <p className="mb-6 text-sm text-gray-500">
        Rates from Frankfurter API via backend. Choose currencies and click Update.
      </p>

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">From</label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">To</label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={loadRate}
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Update"}
        </button>
      </div>

      {error && <p className="mb-4 text-red-600">{error}</p>}
      {rate !== null && !error && (
        <div className="rounded-lg border bg-white p-6 shadow">
          <p className="text-lg">
            1 {from} = <strong>{rate.toFixed(4)}</strong> {to}
          </p>
        </div>
      )}
    </div>
  );
}
