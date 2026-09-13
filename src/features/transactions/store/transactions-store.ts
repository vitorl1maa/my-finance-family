import { create } from "zustand";

import type { Transaction } from "@/src/features/transactions/model/transaction";

type TransactionsState = {
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
};

const initialTransactions: Transaction[] = [
  {
    id: "market",
    accountId: "main-account",
    title: "Supermercado",
    category: "Casa",
    amountCents: -23890,
    occurredAt: "2026-09-13T10:32:00.000Z",
    syncStatus: "pending",
  },
  {
    id: "salary",
    accountId: "main-account",
    title: "Salario",
    category: "Receita",
    amountCents: 580000,
    occurredAt: "2026-09-12T08:00:00.000Z",
    syncStatus: "synced",
  },
];

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: initialTransactions,
  setTransactions: (transactions) => set({ transactions }),
}));
