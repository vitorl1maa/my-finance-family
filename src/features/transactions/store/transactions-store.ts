import { create } from "zustand";

import type { Transaction } from "@/src/features/transactions/model/transaction";

type TransactionsState = {
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  updateTransaction: (transaction: Transaction) => void;
};

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  updateTransaction: (transaction) =>
    set((state) => ({
      transactions: state.transactions.map((item) =>
        item.id === transaction.id ? transaction : item,
      ),
    })),
}));
