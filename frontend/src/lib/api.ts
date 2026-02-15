import type { Expense, ExpenseCreate, ExpenseSummary, ExchangeRate } from "./types";

// Direct backend URL for CORS. Use 127.0.0.1 to avoid IPv6 (::1) connection issues.
const BASE = (() => {
  const raw =
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000")
      : (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000");
  return (raw || "http://127.0.0.1:8000").replace(/\/$/, "");
})();

function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : "/" + path;
  return `${BASE}/api${p}`;
}

const defaultFetchOptions: RequestInit = {
  mode: "cors",
  credentials: "omit",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
};

async function apiFetch(url: string, options: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "Failed to fetch" || message.includes("NetworkError")) {
      throw new Error(
        `Cannot reach backend (${url}). Ensure the Django server is running on port 8000 (e.g. python manage.py runserver 8000). If using direct URL, also check CORS allows your frontend origin.`
      );
    }
    throw err;
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(text || `Expected JSON, got ${contentType}`);
  }
  return res.json();
}

export async function fetchExpenses(): Promise<Expense[]> {
  const url = apiUrl("/expenses/");
  const res = await apiFetch(url, { ...defaultFetchOptions, method: "GET" });
  if (!res.ok) throw new Error(`Failed to fetch expenses: ${res.status}`);
  const data = await parseJson<Expense[]>(res);
  return Array.isArray(data) ? data : [];
}

export async function fetchExpense(id: number | string): Promise<Expense> {
  const url = apiUrl(`/expenses/${id}/`);
  const res = await apiFetch(url, { ...defaultFetchOptions, method: "GET" });
  if (!res.ok) throw new Error(`Failed to fetch expense: ${res.status}`);
  return parseJson<Expense>(res);
}

export async function fetchExpenseSummary(toCurrency?: string): Promise<ExpenseSummary> {
  const path = toCurrency
    ? `/expenses/summary/?to_currency=${encodeURIComponent(toCurrency)}`
    : "/expenses/summary/";
  const url = apiUrl(path);
  const res = await apiFetch(url, { ...defaultFetchOptions, method: "GET" });
  if (!res.ok) throw new Error(`Failed to fetch summary: ${res.status}`);
  return parseJson<ExpenseSummary>(res);
}

export async function createExpense(data: ExpenseCreate): Promise<Expense> {
  const url = apiUrl("/expenses/");
  const res = await apiFetch(url, {
    ...defaultFetchOptions,
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await parseJson<{ detail?: string; amount?: string[] }>(res).catch(() => null);
    const msg =
      err?.detail || (Array.isArray(err?.amount) ? err.amount.join(", ") : null) || `Create failed (${res.status})`;
    throw new Error(msg);
  }
  return parseJson<Expense>(res);
}

export async function updateExpense(
  id: number | string,
  data: Partial<ExpenseCreate>
): Promise<Expense> {
  const url = apiUrl(`/expenses/${id}/`);
  const res = await apiFetch(url, {
    ...defaultFetchOptions,
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update expense: ${res.status}`);
  return parseJson<Expense>(res);
}

export async function deleteExpense(id: number | string): Promise<void> {
  const url = apiUrl(`/expenses/${id}/`);
  const res = await apiFetch(url, { ...defaultFetchOptions, method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete expense: ${res.status}`);
}

export async function fetchExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<ExchangeRate> {
  const params = new URLSearchParams({ from: fromCurrency, to: toCurrency });
  const url = apiUrl(`/rates/?${params}`);
  const res = await apiFetch(url, { ...defaultFetchOptions, method: "GET" });
  if (!res.ok) throw new Error(`Failed to fetch exchange rate: ${res.status}`);
  return parseJson<ExchangeRate>(res);
}
