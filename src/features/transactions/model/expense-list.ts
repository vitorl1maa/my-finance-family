import type { Transaction } from "@/src/features/transactions/model/transaction";

export type ExpenseFilters = {
  authorId?: string;
  month: Date;
  paymentStatus: "all" | "paid" | "pending";
  query: string;
};

export function filterExpensesForMonth<
  T extends Pick<Transaction, "amountCents" | "occurredAt" | "registeredAt">,
>(transactions: T[], month: Date): T[] {
  return transactions.filter((transaction) => {
    const date = new Date(transaction.registeredAt ?? transaction.occurredAt);
    return (
      transaction.amountCents < 0 &&
      date.getFullYear() === month.getFullYear() &&
      date.getMonth() === month.getMonth()
    );
  });
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
