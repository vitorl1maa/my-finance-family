import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/src/features/auth/store/auth-store";
import {
  type ExpenseCategory,
  fallbackExpenseCategories,
} from "@/src/features/categories/model/expense-category";
import { listFamilyCategories } from "@/src/features/categories/repository/categories-repository";
import { buildCreateExpensePayload } from "@/src/features/transactions/model/expense-payload";
import { useTransactionsStore } from "@/src/features/transactions/store/transactions-store";
import { supabase } from "@/src/shared/supabase/supabase-client";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

export function useTransactionsViewModel() {
  const transactions = useTransactionsStore((state) => state.transactions);
  const setTransactions = useTransactionsStore((state) => state.setTransactions);
  const session = useAuthStore((state) => state.session);
  const [categories, setCategories] = useState<ExpenseCategory[]>(fallbackExpenseCategories);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
        let accountId = "main-account";
        let id = `expense-${Date.now()}`;
        let syncStatus: "pending" | "synced" = "pending";

        if (session) {
          const { data, error } = await supabase.rpc("create_expense", {
            expense_title: payload.title,
            expense_category_id: payload.categoryId,
            expense_amount_cents: payload.amountCents,
            expense_occurred_at: payload.occurredAt,
            expense_recurrence_rule: payload.recurrenceRule,
          });

          if (error) throw error;

          const result = Array.isArray(data) ? data[0] : data;
          accountId = result.account_id;
          id = result.transaction_id;
          syncStatus = "synced";
        }

        setTransactions([
          {
            id,
            accountId,
            title: payload.title,
            category: input.categoryName,
            categoryId: input.categoryId,
            amountCents: -Math.abs(payload.amountCents),
            occurredAt: payload.occurredAt,
            recurrenceRule: payload.recurrenceRule,
            syncStatus,
          },
          ...transactions,
        ]);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Não foi possível salvar a despesa.");
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [session, setTransactions, transactions],
  );

  return useMemo(
    () => ({
      transactions: transactions.map((transaction) => ({
        ...transaction,
        formattedAmount: formatCurrencyFromCents(transaction.amountCents),
        isExpense: transaction.amountCents < 0,
      })),
      createExpense,
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
      saveError,
      transactions,
    ],
  );
}
