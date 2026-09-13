import { useMemo } from "react";

import { useTransactionsStore } from "@/src/features/transactions/store/transactions-store";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

export function useTransactionsViewModel() {
  const transactions = useTransactionsStore((state) => state.transactions);

  return useMemo(
    () => ({
      transactions: transactions.map((transaction) => ({
        ...transaction,
        formattedAmount: formatCurrencyFromCents(transaction.amountCents),
        isExpense: transaction.amountCents < 0,
      })),
    }),
    [transactions],
  );
}
