import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/src/features/auth/store/auth-store";
import {
  defaultExpenseCategories,
  type ExpenseCategory,
} from "@/src/features/categories/model/expense-category";
import { buildCreateExpensePayload } from "@/src/features/transactions/model/expense-payload";
import type { Transaction } from "@/src/features/transactions/model/transaction";
import {
  createRemoteExpense,
  deleteRemoteExpense,
  listRemoteTransactions,
  syncRemoteExpense,
  updateRemoteExpense,
} from "@/src/features/transactions/repository/transactions-remote-repository";
import {
  deleteTransaction,
  listTransactions,
  replaceTransaction,
  upsertTransactions,
} from "@/src/features/transactions/repository/transactions-repository";
import { useTransactionsStore } from "@/src/features/transactions/store/transactions-store";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

export function useTransactionsViewModel() {
  const db = useSQLiteContext();
  const transactions = useTransactionsStore((state) => state.transactions);
  const setTransactions = useTransactionsStore((state) => state.setTransactions);
  const session = useAuthStore((state) => state.session);
  const categories: ExpenseCategory[] = defaultExpenseCategories;
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    setTransactionsError(null);

    try {
      const localTransactions = await listTransactions(db);
      setTransactions(localTransactions);
      if (localTransactions.length === 0) setTransactionsLoading(false);

      if (!session) return;

      for (const transaction of localTransactions.filter(
        (item) => item.syncStatus !== "synced" && item.amountCents < 0 && item.categoryId,
      )) {
        try {
          await replaceTransaction(db, transaction.id, await syncRemoteExpense(transaction));
        } catch {
          // Keep the local expense pending so a later refresh can retry it.
        }
      }

      const remoteTransactions = await listRemoteTransactions();
      await upsertTransactions(db, remoteTransactions);
      setTransactions(await listTransactions(db));
    } catch {
      setTransactionsError("Não foi possível atualizar as transações agora.");
    } finally {
      setTransactionsLoading(false);
    }
  }, [db, session, setTransactions]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const reloadCategories = useCallback(() => undefined, []);

  const createExpense = useCallback(
    async (input: {
      title: string;
      categoryId: string;
      categoryName: string;
      amount: string;
      occurredAt: string;
      recurrenceRule: string;
    }) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        const payload = buildCreateExpensePayload(input);
        const pendingTransaction = {
          id: `pending-expense-${Date.now()}`,
          accountId: "",
          title: payload.title,
          category: input.categoryName,
          categoryId: input.categoryId,
          amountCents: -Math.abs(payload.amountCents),
          occurredAt: payload.occurredAt,
          registeredAt: new Date().toISOString(),
          recurrenceRule: payload.recurrenceRule,
          syncStatus: "pending" as const,
        };

        await upsertTransactions(db, [pendingTransaction]);
        setTransactions(await listTransactions(db));

        if (!session) return;

        try {
          const syncedTransaction = await createRemoteExpense(payload);
          await replaceTransaction(db, pendingTransaction.id, syncedTransaction);
          setTransactions(await listTransactions(db));
        } catch {
          setTransactionsError(
            "Despesa salva no dispositivo. A sincronização será tentada depois.",
          );
        }
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Não foi possível salvar a despesa.");
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [db, session, setTransactions],
  );

  const updateExpense = useCallback(
    async (transaction: Transaction) => {
      const pending = { ...transaction, syncStatus: "pending" as const };
      await upsertTransactions(db, [pending]);
      setTransactions(await listTransactions(db));
      if (!session) return;
      try {
        await replaceTransaction(db, transaction.id, await updateRemoteExpense(transaction));
        setTransactions(await listTransactions(db));
      } catch {
        setTransactionsError(
          "Despesa atualizada no dispositivo. A sincronização será tentada depois.",
        );
      }
    },
    [db, session, setTransactions],
  );

  const removeExpense = useCallback(
    async (id: string) => {
      await deleteTransaction(db, id);
      setTransactions(await listTransactions(db));
      if (!session) return;
      try {
        await deleteRemoteExpense(id);
      } catch {
        setTransactionsError("Despesa removida do dispositivo, mas não foi possível sincronizar.");
      }
    },
    [db, session, setTransactions],
  );

  return useMemo(
    () => ({
      transactions: transactions.map((transaction) => ({
        ...transaction,
        formattedAmount: formatCurrencyFromCents(transaction.amountCents),
        isExpense: transaction.amountCents < 0,
      })),
      createExpense,
      updateExpense,
      removeExpense,
      transactionsLoading,
      transactionsError,
      reloadTransactions: loadTransactions,
      categories,
      categoriesLoading: false,
      categoriesError: null,
      reloadCategories,
      isSaving,
      saveError,
    }),
    [
      createExpense,
      updateExpense,
      removeExpense,
      isSaving,
      reloadCategories,
      loadTransactions,
      saveError,
      transactions,
      transactionsError,
      transactionsLoading,
    ],
  );
}
