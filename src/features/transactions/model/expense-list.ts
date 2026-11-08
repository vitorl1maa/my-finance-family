import type { Transaction } from "@/src/features/transactions/model/transaction";
// @ts-expect-error Node's native TypeScript test runner requires the source extension here.
import { getExpenseOccurrencesForMonth } from "../../dashboard/model/expense-occurrences.ts";

export type ExpenseFilters = {
  authorId?: string;
  month: Date;
  paymentStatus: "all" | "paid" | "pending";
  query: string;
};

type ExpenseProjection = Pick<
  Transaction,
  "amountCents" | "id" | "occurredAt" | "paidAt" | "paymentStatus" | "recurrenceRule" | "title"
>;

export function filterExpensesForMonth<T extends ExpenseProjection>(
  transactions: T[],
  month: Date,
): T[] {
  return transactions.flatMap((transaction) =>
    getExpenseOccurrencesForMonth(transaction, month).map((occurrence) => {
      const isPaid = occurrence.paymentStatus === "paid";
      return {
        ...transaction,
        occurredAt: `${occurrence.dateKey}T12:00:00.000Z`,
        paidAt: isPaid ? transaction.paidAt : undefined,
        paymentStatus: occurrence.paymentStatus,
      } as T;
    }),
  );
}

export function filterExpenses(
  transactions: Transaction[],
  filters: ExpenseFilters,
): Transaction[] {
  const normalizedQuery = filters.query.trim().toLocaleLowerCase("pt-BR");

  return filterExpensesForMonth(transactions, filters.month).filter((transaction) => {
    const matchesStatus =
      filters.paymentStatus === "all" || transaction.paymentStatus === filters.paymentStatus;
    const matchesAuthor = !filters.authorId || transaction.creatorId === filters.authorId;
    const matchesQuery =
      !normalizedQuery || transaction.title.toLocaleLowerCase("pt-BR").includes(normalizedQuery);

    return matchesStatus && matchesAuthor && matchesQuery;
  });
}
