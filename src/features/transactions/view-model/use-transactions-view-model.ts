import { useCallback, useMemo } from "react";

import { useTransactionsStore } from "@/src/features/transactions/store/transactions-store";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

export function useTransactionsViewModel() {
  const transactions = useTransactionsStore((state) => state.transactions);
  const setTransactions = useTransactionsStore((state) => state.setTransactions);

  const createExpense = useCallback(
    (input: { title: string; category: string; amount: string }) => {
      const amountCents = Math.round(Number(input.amount.replace(",", ".")) * 100);

      setTransactions([
        {
          id: `expense-${Date.now()}`,
          accountId: "main-account",
          title: input.title.trim(),
          category: input.category,
          amountCents: -Math.abs(amountCents),
          occurredAt: new Date().toISOString(),
          syncStatus: "pending",
        },
        ...transactions,
      ]);
    },
    [setTransactions, transactions],
  );

  return useMemo(
    () => ({
      transactions: transactions.map((transaction) => ({
        ...transaction,
        formattedAmount: formatCurrencyFromCents(transaction.amountCents),
        isExpense: transaction.amountCents < 0,
      })),
      createExpense,
    }),
    [createExpense, transactions],
  );
}
