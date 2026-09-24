import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/src/features/auth/store/auth-store";
import {
  type IncomeSource,
  totalIncomeSources,
} from "@/src/features/income-sources/model/income-source";
import {
  deleteRemoteIncomeSource,
  getRemotePiggyBankSettings,
  listRemoteIncomeSources,
  upsertRemoteIncomeSource,
  upsertRemotePiggyBankSettings,
} from "@/src/features/income-sources/repository/income-sources-remote-repository";
import {
  deleteIncomeSource,
  getPiggyBankSettings,
  listIncomeSources,
  saveIncomeSource,
  savePiggyBankSettings,
} from "@/src/features/income-sources/repository/income-sources-repository";
import {
  getRemoteWalletSettings,
  transferRemoteWallet,
} from "@/src/features/wallet/repository/wallet-remote-repository";
import {
  applyWalletDelta,
  getIncomeSourceWalletDelta,
  transferBetweenBalances,
} from "@/src/features/wallet/model/wallet";
import { getWalletSettings, saveWalletSettings } from "@/src/features/wallet/repository/wallet-repository";
import { useWalletStore } from "@/src/features/wallet/store/wallet-store";
import { useIncomeSourcesStore } from "@/src/features/income-sources/store/income-sources-store";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

export function useIncomeSourcesViewModel() {
  const db = useSQLiteContext();
  const sources = useIncomeSourcesStore((state) => state.sources);
  const setSources = useIncomeSourcesStore((state) => state.setSources);
  const addSource = useIncomeSourcesStore((state) => state.addSource);
  const setBalances = useWalletStore((state) => state.setBalances);
  const setWalletBalance = useWalletStore((state) => state.setWalletBalance);
  const walletBalanceCents = useWalletStore((state) => state.walletBalanceCents);
  const piggyBankBalanceCents = useWalletStore((state) => state.piggyBankBalanceCents);
  const session = useAuthStore((state) => state.session);
  const [loading, setLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceCents, setBalanceCents] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadSources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let loadedSources = await listIncomeSources(db);
      setSources(loadedSources);
      if (loadedSources.length === 0) {
        setLoading(false);
        setBalanceLoading(false);
      }
      let settings = await getPiggyBankSettings(db);
      setBalanceCents(settings?.balanceCents ?? 0);
      const walletSettings = await getWalletSettings(db);
      setWalletBalance(walletSettings?.balanceCents ?? 0);
      setBalances(walletSettings?.balanceCents ?? 0, settings?.balanceCents ?? 0);

      if (!session) return;

      for (const source of loadedSources.filter((item) => item.syncStatus !== "synced")) {
        try {
          await saveIncomeSource(db, await upsertRemoteIncomeSource(source));
        } catch {
          // Keep the local source pending so a later session refresh can retry it.
        }
      }

      if (settings && settings.syncStatus !== "synced") {
        try {
          await savePiggyBankSettings(
            db,
            await upsertRemotePiggyBankSettings(settings.balanceCents),
          );
        } catch {
          // The local balance remains pending when the device is offline.
        }
      }

      const [remoteSources, remoteSettings, remoteWallet] = await Promise.all([
        listRemoteIncomeSources(),
        getRemotePiggyBankSettings(),
        getRemoteWalletSettings(),
      ]);
      await Promise.all(remoteSources.map((source) => saveIncomeSource(db, source)));
      if (remoteSettings) await savePiggyBankSettings(db, remoteSettings);
      if (remoteWallet) {
        await saveWalletSettings(db, {
          balanceCents: remoteWallet.balance_cents,
          updatedAt: remoteWallet.updated_at,
          syncStatus: "synced",
        });
      }

      loadedSources = await listIncomeSources(db);
      settings = await getPiggyBankSettings(db);
      setSources(loadedSources);
      setBalanceCents(settings?.balanceCents ?? 0);
      const loadedWallet = await getWalletSettings(db);
      setBalances(loadedWallet?.balanceCents ?? 0, settings?.balanceCents ?? 0);
    } catch {
      setError("Não foi possível carregar suas fontes de renda.");
    } finally {
      setLoading(false);
      setBalanceLoading(false);
    }
  }, [db, session, setSources]);

  useEffect(() => {
    void loadSources();
  }, [loadSources]);

  const createSource = useCallback(
    async (name: string, amountCents: number, kind: IncomeSource["kind"] = "other") => {
      const source: IncomeSource = {
        id: `income-source-${Date.now()}`,
        name: name.trim(),
        kind,
        amountCents,
        updatedAt: new Date().toISOString(),
        syncStatus: "pending",
      };
      await saveIncomeSource(db, source);
      addSource(source);
      const nextWalletBalance = applyWalletDelta(
        walletBalanceCents,
        getIncomeSourceWalletDelta(undefined, amountCents),
      );
      await saveWalletSettings(db, {
        balanceCents: nextWalletBalance,
        updatedAt: new Date().toISOString(),
        syncStatus: "pending",
      });
      setWalletBalance(nextWalletBalance);

      if (!session) return;

      try {
        await saveIncomeSource(db, await upsertRemoteIncomeSource(source));
        setSources(await listIncomeSources(db));
      } catch {
        setError("Fonte salva no dispositivo. A sincronização será tentada depois.");
      }
    },
    [addSource, db, session, setSources, setWalletBalance, walletBalanceCents],
  );

  const updateSource = useCallback(
    async (source: IncomeSource) => {
      const pending = {
        ...source,
        syncStatus: "pending" as const,
        updatedAt: new Date().toISOString(),
      };
      await saveIncomeSource(db, pending);
      setSources(await listIncomeSources(db));
      const previousSource = sources.find((item) => item.id === source.id);
      const nextWalletBalance = applyWalletDelta(
        walletBalanceCents,
        getIncomeSourceWalletDelta(previousSource?.amountCents, source.amountCents),
      );
      await saveWalletSettings(db, {
        balanceCents: nextWalletBalance,
        updatedAt: new Date().toISOString(),
        syncStatus: "pending",
      });
      setWalletBalance(nextWalletBalance);
      if (!session) return;
      try {
        await saveIncomeSource(db, await upsertRemoteIncomeSource(pending));
        setSources(await listIncomeSources(db));
      } catch {
        setError("Fonte atualizada no dispositivo. A sincronização será tentada depois.");
      }
    },
    [db, session, setSources, setWalletBalance, sources, walletBalanceCents],
  );

  const removeSource = useCallback(
    async (id: string) => {
      const previousSource = sources.find((item) => item.id === id);
      await deleteIncomeSource(db, id);
      setSources(await listIncomeSources(db));
      const nextWalletBalance = applyWalletDelta(
        walletBalanceCents,
        getIncomeSourceWalletDelta(previousSource?.amountCents, undefined),
      );
      await saveWalletSettings(db, {
        balanceCents: nextWalletBalance,
        updatedAt: new Date().toISOString(),
        syncStatus: "pending",
      });
      setWalletBalance(nextWalletBalance);
      if (!session) return;
      try {
        await deleteRemoteIncomeSource(id);
      } catch {
        setError("Fonte removida do dispositivo, mas não foi possível sincronizar.");
      }
    },
    [db, session, setSources, setWalletBalance, sources, walletBalanceCents],
  );

  const saveBalance = useCallback(
    async (nextBalanceCents: number) => {
      await savePiggyBankSettings(db, {
        balanceCents: nextBalanceCents,
        updatedAt: new Date().toISOString(),
        syncStatus: "pending",
      });
      setBalanceCents(nextBalanceCents);
      useWalletStore.getState().setPiggyBankBalance(nextBalanceCents);

      if (!session) return;

      try {
        const syncedSettings = await upsertRemotePiggyBankSettings(nextBalanceCents);
        await savePiggyBankSettings(db, syncedSettings);
        setBalanceCents(syncedSettings.balanceCents);
        useWalletStore.getState().setPiggyBankBalance(syncedSettings.balanceCents);
      } catch {
        setError("Saldo salvo no dispositivo. A sincronização será tentada depois.");
      }
    },
    [db, session],
  );

  const transfer = useCallback(
    async (direction: "to_piggy_bank" | "from_piggy_bank", amountCents: number) => {
      const nextBalances = transferBetweenBalances(
        { walletBalanceCents, piggyBankBalanceCents },
        amountCents,
        direction,
      );
      const now = new Date().toISOString();
      await saveWalletSettings(db, {
        balanceCents: nextBalances.walletBalanceCents,
        updatedAt: now,
        syncStatus: "pending",
      });
      await savePiggyBankSettings(db, {
        balanceCents: nextBalances.piggyBankBalanceCents,
        updatedAt: now,
        syncStatus: "pending",
      });
      setBalances(nextBalances.walletBalanceCents, nextBalances.piggyBankBalanceCents);
      setBalanceCents(nextBalances.piggyBankBalanceCents);

      if (!session) return;

      const synced = await transferRemoteWallet(direction, amountCents);
      const syncedAt = new Date().toISOString();
      await saveWalletSettings(db, {
        balanceCents: synced.wallet_balance_cents,
        updatedAt: syncedAt,
        syncStatus: "synced",
      });
      await savePiggyBankSettings(db, {
        balanceCents: synced.piggy_bank_balance_cents,
        updatedAt: syncedAt,
        syncStatus: "synced",
      });
      setBalances(synced.wallet_balance_cents, synced.piggy_bank_balance_cents);
      setBalanceCents(synced.piggy_bank_balance_cents);
    },
    [db, piggyBankBalanceCents, session, setBalances, walletBalanceCents],
  );

  const totalCents = useMemo(() => totalIncomeSources(sources), [sources]);

  return {
    sources,
    totalCents,
    balanceCents,
    walletBalanceCents,
    piggyBankBalanceCents: balanceCents,
    formattedWalletBalance: formatCurrencyFromCents(walletBalanceCents),
    formattedTotal: formatCurrencyFromCents(balanceCents),
    balanceLoading,
    loading,
    error,
    createSource,
    updateSource,
    removeSource,
    saveBalance,
    transfer,
    reload: loadSources,
  };
}
