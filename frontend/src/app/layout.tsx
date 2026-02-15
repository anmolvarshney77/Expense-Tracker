import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track expenses with CRUD, dashboard, and exchange rates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <nav className="border-b bg-white px-4 py-3 shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center gap-6">
            <Link href="/" className="text-lg font-semibold text-gray-900">
              Expense Tracker
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Expenses
            </Link>
            <Link href="/expenses/new" className="text-gray-600 hover:text-gray-900">
              Add expense
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/rates" className="text-gray-600 hover:text-gray-900">
              Exchange rates
            </Link>
          </div>
        </nav>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
