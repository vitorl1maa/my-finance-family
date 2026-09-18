import { format, isSameDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { Transaction } from "@/src/features/transactions/model/transaction";

export type TransactionDayGroup = {
  id: string;
  label: string;
  transactions: Transaction[];
};

export function filterTransactions(transactions: Transaction[], query: string): Transaction[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");

  if (!normalizedQuery) return sortTransactions(transactions);

  return sortTransactions(transactions).filter((transaction) => {
    const title = transaction.title.toLocaleLowerCase("pt-BR");
    const category = transaction.category.toLocaleLowerCase("pt-BR");

    return title.includes(normalizedQuery) || category.includes(normalizedQuery);
  });
}

export function groupTransactionsByDay(
  transactions: Transaction[],
  referenceDate: Date,
): TransactionDayGroup[] {
  const groups = new Map<string, TransactionDayGroup>();

  for (const transaction of sortTransactions(transactions)) {
    const date = new Date(transaction.occurredAt);
    const id = format(date, "yyyy-MM-dd");
    const group = groups.get(id);

    if (group) {
      group.transactions.push(transaction);
      continue;
    }

    groups.set(id, {
      id,
      label: getTransactionDayLabel(date, referenceDate),
      transactions: [transaction],
    });
  }

  return [...groups.values()];
}

function sortTransactions(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort(
    (left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  );
}

function getTransactionDayLabel(date: Date, referenceDate: Date): string {
  if (isSameDay(date, referenceDate)) return "HOJE";
  if (isSameDay(date, subDays(referenceDate, 1))) return "ONTEM";

  return format(date, "d 'de' MMMM", { locale: ptBR });
}
