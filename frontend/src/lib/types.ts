export type ExpenseCategory = "food" | "transport" | "bills" | "shopping" | "other";

export interface Expense {
  id: number;
  amount: string;
  currency: string;
  category: ExpenseCategory;
  date: string;
  description: string;
  merchant: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCreate {
  amount: string;
  currency: string;
  category: ExpenseCategory;
  date: string;
  description?: string;
  merchant?: string;
}

export interface SummaryTotals {
  total: number;
  count: number;
  average: number;
}

export interface CategorySummary {
  category: string;
  total: number;
  count: number;
}

export interface MonthSummary {
  month: string;
  total: number;
  count: number;
}

export interface CurrencySummary {
  currency: string;
  total: number;
  count: number;
  average: number;
}

export interface CategoryCurrencySummary {
  category: string;
  currency: string;
  total: number;
  count: number;
}

export interface MonthCurrencySummary {
  month: string;
  currency: string;
  total: number;
  count: number;
}

export interface ExpenseSummary {
  by_category: CategorySummary[];
  by_month: MonthSummary[];
  by_currency?: CurrencySummary[];
  by_category_currency?: CategoryCurrencySummary[];
  by_month_currency?: MonthCurrencySummary[];
  totals: SummaryTotals;
  /** Set when summary was requested with ?to_currency= (all amounts in this currency). */
  display_currency?: string;
}

export interface ExchangeRate {
  rate: number;
  from: string;
  to: string;
}
