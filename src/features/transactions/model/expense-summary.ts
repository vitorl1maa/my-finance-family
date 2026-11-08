import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Transaction } from "@/src/features/transactions/model/transaction";
// @ts-expect-error Node's native TypeScript test runner requires the source extension here.
import { getExpenseOccurrencesForMonth } from "../../dashboard/model/expense-occurrences.ts";

export function getExpenseMonthLabel(referenceDate: Date = new Date()): string {
  return `SUAS DESPESAS DE ${format(referenceDate, "MMMM", { locale: ptBR }).toLocaleUpperCase("pt-BR")}`;
}

export function getExpenseTotalForMonth(
  transactions: Transaction[],
  referenceDate: Date = new Date(),
): number {
  return transactions
    .filter((transaction) => transaction.amountCents < 0)
    .flatMap((transaction) => getExpenseOccurrencesForMonth(transaction, referenceDate))
    .reduce((total, expense) => total + Math.abs(expense.amountCents), 0);
}

export function getExpensePercentageComparedToNextMonth(
  transactions: Transaction[],
  referenceDate: Date = new Date(),
): number | null {
  const currentMonthTotal = getExpenseTotalForMonth(transactions, referenceDate);
  const nextMonthTotal = getExpenseTotalForMonth(transactions, addMonths(referenceDate, 1));

  if (nextMonthTotal === 0) return null;

  return ((currentMonthTotal - nextMonthTotal) / nextMonthTotal) * 100;
}

export function getExpenseSavingsComparedToPreviousMonth(
  transactions: Transaction[],
  referenceDate: Date = new Date(),
): number | null {
  const previousMonthTotal = getExpenseTotalForMonth(transactions, addMonths(referenceDate, -1));
  if (previousMonthTotal === 0) return null;

  return previousMonthTotal - getExpenseTotalForMonth(transactions, referenceDate);
}
