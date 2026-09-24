import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProfileAvatarMetadata } from "@/src/features/auth/model/profile-avatar";
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
  const session = useAuthStore((state) => state.session);
  const walletBalanceCents = useWalletStore((state) => state.walletBalanceCents);
  const setWalletBalance = useWalletStore((state) => state.setWalletBalance);
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
      const localWallet = await getWalletSettings(db);
      setWalletBalance(localWallet?.balanceCents ?? 0);
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
          getExpenseWalletDelta(undefined, pendingTransaction.amountCents),
        );

        await upsertTransactions(db, [pendingTransaction]);
        await saveWalletSettings(db, {
          balanceCents: nextWalletBalance,
          updatedAt: new Date().toISOString(),
          syncStatus: "pending",
        });
        setWalletBalance(nextWalletBalance);
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
    [db, session, setTransactions, setWalletBalance, walletBalanceCents],
  );

  const updateExpense = useCallback(
    async (transaction: Transaction) => {
      const previousTransaction = transactions.find((item) => item.id === transaction.id);
      const pending = { ...transaction, syncStatus: "pending" as const };
      const nextWalletBalance = applyWalletDelta(
        walletBalanceCents,
        getExpenseWalletDelta(previousTransaction?.amountCents, transaction.amountCents),
      );
      await upsertTransactions(db, [pending]);
      await saveWalletSettings(db, {
        balanceCents: nextWalletBalance,
        updatedAt: new Date().toISOString(),
        syncStatus: "pending",
      });
      setWalletBalance(nextWalletBalance);
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
    [db, session, setTransactions, setWalletBalance, transactions, walletBalanceCents],
  );

  const removeExpense = useCallback(
    async (id: string) => {
      const previousTransaction = transactions.find((item) => item.id === id);
      await deleteTransaction(db, id);
      const nextWalletBalance = applyWalletDelta(
        walletBalanceCents,
        getExpenseWalletDelta(previousTransaction?.amountCents, undefined),
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

function getCreatorName(metadata: unknown, email: string | undefined): string | undefined {
  const profile = metadata as { full_name?: string; name?: string } | undefined;
  return profile?.full_name || profile?.name || email?.split("@")[0];
}
