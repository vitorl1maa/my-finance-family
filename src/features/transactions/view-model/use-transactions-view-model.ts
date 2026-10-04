import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProfileAvatarMetadata } from "@/src/features/auth/model/profile-avatar";
import { useAuthStore } from "@/src/features/auth/store/auth-store";
import {
  type ExpenseCategory,
  resolveExpenseCategories,
} from "@/src/features/categories/model/expense-category";
import { listFamilyCategories } from "@/src/features/categories/repository/categories-repository";
import { buildCreateExpensePayload } from "@/src/features/transactions/model/expense-payload";
import type { Transaction } from "@/src/features/transactions/model/transaction";
import {
  createRemoteExpense,
  deleteRemoteExpense,
  listRemoteTransactions,
  markRemoteExpensePaid,
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
import { applyWalletDelta, getExpenseWalletDelta } from "@/src/features/wallet/model/wallet";
import { getRemoteWalletSettings } from "@/src/features/wallet/repository/wallet-remote-repository";
import {
  getWalletSettings,
  saveWalletSettings,
} from "@/src/features/wallet/repository/wallet-repository";
import { useWalletStore } from "@/src/features/wallet/store/wallet-store";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

export function useTransactionsViewModel() {
  const db = useSQLiteContext();
  const transactions = useTransactionsStore((state) => state.transactions);
  const setTransactions = useTransactionsStore((state) => state.setTransactions);
  const updateTransaction = useTransactionsStore((state) => state.updateTransaction);
  const session = useAuthStore((state) => state.session);
  const walletBalanceCents = useWalletStore((state) => state.walletBalanceCents);
  const setWalletBalance = useWalletStore((state) => state.setWalletBalance);
  const [remoteCategories, setRemoteCategories] = useState<ExpenseCategory[]>([]);
  const categories = resolveExpenseCategories(Boolean(session), remoteCategories);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(Boolean(session));
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    setTransactionsError(null);

    try {
      const localTransactions = await listTransactions(db);
      setTransactions(localTransactions);
      const localWallet = await getWalletSettings(db);
      setWalletBalance(localWallet?.balanceCents ?? 0);
      if (localTransactions.length === 0) setTransactionsLoading(false);

      if (!session) return;

      for (const transaction of localTransactions.filter(
        (item) => item.syncStatus !== "synced" && item.amountCents < 0 && item.categoryId,
      )) {
        try {
          if (transaction.syncOperation === "mark_paid") {
            await upsertTransactions(db, [await markRemoteExpensePaid(transaction.id)]);
          } else if (transaction.syncOperation === "update") {
            await upsertTransactions(db, [await updateRemoteExpense(transaction)]);
          } else {
            await replaceTransaction(db, transaction.id, await syncRemoteExpense(transaction));
          }
        } catch {
          // Keep the local expense pending so a later refresh can retry it.
        }
      }

      const remoteTransactions = await listRemoteTransactions();
      await upsertTransactions(db, remoteTransactions);
      const remoteWallet = await getRemoteWalletSettings();
      if (remoteWallet) {
        await saveWalletSettings(db, {
          balanceCents: remoteWallet.balance_cents,
          updatedAt: remoteWallet.updated_at,
          syncStatus: "synced",
        });
        setWalletBalance(remoteWallet.balance_cents);
      }
      setTransactions(await listTransactions(db));
    } catch {
      setTransactionsError("Não foi possível atualizar as transações agora.");
    } finally {
      setTransactionsLoading(false);
    }
  }, [db, session, setTransactions, setWalletBalance]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const reloadCategories = useCallback(async () => {
    if (!session) {
      setRemoteCategories([]);
      setCategoriesError(null);
      setCategoriesLoading(false);
      return;
    }

    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      setRemoteCategories(await listFamilyCategories());
    } catch {
      setRemoteCategories([]);
      setCategoriesError("Não foi possível carregar as categorias da família.");
    } finally {
      setCategoriesLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void reloadCategories();
  }, [reloadCategories]);

  const createExpense = useCallback(
    async (input: {
      title: string;
      categoryId: string;
      categoryName: string;
      amount: string;
      occurredAt: string;
      recurrenceRule: string;
      paymentMethod: "credit_card" | "debit_card" | "pix" | "cash";
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
          paymentMethod: payload.paymentMethod,
          paymentStatus: "pending" as const,
          syncOperation: "create" as const,
          creatorId: session?.user.id,
          creatorName: getCreatorName(session?.user.user_metadata, session?.user.email),
          creatorAvatarUrl: (session?.user.user_metadata as ProfileAvatarMetadata | undefined)
            ?.avatar_url,
          creatorAvatarSeed: (session?.user.user_metadata as ProfileAvatarMetadata | undefined)
            ?.avatar_seed,
          syncStatus: "pending" as const,
        };

        const nextWalletBalance = applyWalletDelta(
          walletBalanceCents,
          getExpenseWalletDelta(undefined, pendingTransaction),
        );

        await upsertTransactions(db, [pendingTransaction]);
        await saveWalletSettings(db, {
          balanceCents: nextWalletBalance,
          updatedAt: new Date().toISOString(),
          syncStatus: "pending",
        });
        setWalletBalance(nextWalletBalance);
        setTransactions(await listTransactions(db));

        if (!session) return true;

        try {
          const syncedTransaction = await createRemoteExpense(payload);
          await replaceTransaction(db, pendingTransaction.id, syncedTransaction);
          setTransactions(await listTransactions(db));
        } catch {
          setTransactionsError(
            "Despesa salva no dispositivo. A sincronização será tentada depois.",
          );
        }
        return true;
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Não foi possível salvar a despesa.");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [db, session, setTransactions, setWalletBalance, walletBalanceCents],
  );

  const updateExpense = useCallback(
    async (transaction: Transaction) => {
      const previousTransaction = transactions.find((item) => item.id === transaction.id);
      const pending = {
        ...transaction,
        syncOperation: "update" as const,
        syncStatus: "pending" as const,
      };
      const nextWalletBalance = applyWalletDelta(
        walletBalanceCents,
        getExpenseWalletDelta(previousTransaction, transaction),
      );
      await upsertTransactions(db, [pending]);
      await saveWalletSettings(db, {
        balanceCents: nextWalletBalance,
        updatedAt: new Date().toISOString(),
        syncStatus: "pending",
      });
      setWalletBalance(nextWalletBalance);
      updateTransaction(pending);
      if (!session) return;
      try {
        const syncedTransaction = await updateRemoteExpense(transaction);
        await replaceTransaction(db, transaction.id, syncedTransaction);
        updateTransaction(syncedTransaction);
      } catch {
        setTransactionsError(
          "Despesa atualizada no dispositivo. A sincronização será tentada depois.",
        );
      }
    },
    [
      db,
      session,
      setWalletBalance,
      transactions,
      updateTransaction,
      walletBalanceCents,
    ],
  );

  const removeExpense = useCallback(
    async (id: string) => {
      const previousTransaction = transactions.find((item) => item.id === id);
      await deleteTransaction(db, id);
      const nextWalletBalance = applyWalletDelta(
        walletBalanceCents,
        getExpenseWalletDelta(previousTransaction, undefined),
      );
      await saveWalletSettings(db, {
        balanceCents: nextWalletBalance,
        updatedAt: new Date().toISOString(),
        syncStatus: "pending",
      });
      setWalletBalance(nextWalletBalance);
      setTransactions(await listTransactions(db));
      if (!session) return;
      try {
        await deleteRemoteExpense(id);
      } catch {
        setTransactionsError("Despesa removida do dispositivo, mas não foi possível sincronizar.");
      }
    },
    [db, session, setTransactions, setWalletBalance, transactions, walletBalanceCents],
  );

  const markExpenseAsPaid = useCallback(
    async (transaction: Transaction) => {
      if (transaction.paymentStatus === "paid") return true;
      const pending = {
        ...transaction,
        paidAt: new Date().toISOString(),
        paymentStatus: "paid" as const,
        syncOperation: "mark_paid" as const,
        syncStatus: "pending" as const,
      };
      try {
        const nextWalletBalance = applyWalletDelta(
          walletBalanceCents,
          getExpenseWalletDelta(transaction, pending),
        );
        await upsertTransactions(db, [pending]);
        await saveWalletSettings(db, {
          balanceCents: nextWalletBalance,
          updatedAt: new Date().toISOString(),
          syncStatus: "pending",
        });
        setWalletBalance(nextWalletBalance);
        setTransactions(await listTransactions(db));
        if (!session) return true;
        await upsertTransactions(db, [await markRemoteExpensePaid(transaction.id)]);
        setTransactions(await listTransactions(db));
        return true;
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : "Não foi possível marcar a despesa como paga.",
        );
        return false;
      }
    },
    [db, session, setTransactions, setWalletBalance, walletBalanceCents],
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
      markExpenseAsPaid,
      transactionsLoading,
      transactionsError,
      reloadTransactions: loadTransactions,
      categories,
      categoriesLoading,
      categoriesError,
      reloadCategories,
      isSaving,
      saveError,
    }),
    [
      createExpense,
      updateExpense,
      removeExpense,
      markExpenseAsPaid,
      categories,
      categoriesError,
      categoriesLoading,
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

function getCreatorName(metadata: unknown, email: string | undefined): string | undefined {
  const profile = metadata as { full_name?: string; name?: string } | undefined;
  return profile?.full_name || profile?.name || email?.split("@")[0];
}
