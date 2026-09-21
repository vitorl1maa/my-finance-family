import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/src/features/auth/store/auth-store";
import type { ExpenseCategory } from "@/src/features/categories/model/expense-category";
import { listFamilyCategories } from "@/src/features/categories/repository/categories-repository";
import { buildCreateExpensePayload } from "@/src/features/transactions/model/expense-payload";
import {
  createRemoteExpense,
  listRemoteTransactions,
  syncRemoteExpense,
} from "@/src/features/transactions/repository/transactions-remote-repository";
import {
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
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
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

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);

    try {
      const remoteCategories = await listFamilyCategories();

      if (remoteCategories.length > 0) setCategories(remoteCategories);
    } catch {
      if (session) setCategoriesError("Não foi possível atualizar as categorias.");
    } finally {
      setCategoriesLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

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

  return useMemo(
    () => ({
      transactions: transactions.map((transaction) => ({
        ...transaction,
        formattedAmount: formatCurrencyFromCents(transaction.amountCents),
        isExpense: transaction.amountCents < 0,
      })),
      createExpense,
      transactionsLoading,
      transactionsError,
      reloadTransactions: loadTransactions,
      categories,
      categoriesLoading,
      categoriesError,
      reloadCategories: loadCategories,
      isSaving,
      saveError,
    }),
    [
      categories,
      categoriesError,
      categoriesLoading,
      createExpense,
      isSaving,
      loadCategories,
      loadTransactions,
      saveError,
      transactions,
      transactionsError,
      transactionsLoading,
    ],
  );
}
