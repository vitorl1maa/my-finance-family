import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/src/features/auth/store/auth-store";
import {
  type IncomeSource,
  totalIncomeSources,
} from "@/src/features/income-sources/model/income-source";
import {
  getRemotePiggyBankSettings,
  listRemoteIncomeSources,
  upsertRemoteIncomeSource,
  upsertRemotePiggyBankSettings,
} from "@/src/features/income-sources/repository/income-sources-remote-repository";
import {
  getPiggyBankSettings,
  listIncomeSources,
  saveIncomeSource,
  savePiggyBankSettings,
} from "@/src/features/income-sources/repository/income-sources-repository";
import { useIncomeSourcesStore } from "@/src/features/income-sources/store/income-sources-store";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

export function useIncomeSourcesViewModel() {
  const db = useSQLiteContext();
  const sources = useIncomeSourcesStore((state) => state.sources);
  const setSources = useIncomeSourcesStore((state) => state.setSources);
  const addSource = useIncomeSourcesStore((state) => state.addSource);
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
      let settings = await getPiggyBankSettings(db);
      setBalanceCents(settings?.balanceCents ?? 0);

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

      const [remoteSources, remoteSettings] = await Promise.all([
        listRemoteIncomeSources(),
        getRemotePiggyBankSettings(),
      ]);
      await Promise.all(remoteSources.map((source) => saveIncomeSource(db, source)));
      if (remoteSettings) await savePiggyBankSettings(db, remoteSettings);

      loadedSources = await listIncomeSources(db);
      settings = await getPiggyBankSettings(db);
      setSources(loadedSources);
      setBalanceCents(settings?.balanceCents ?? 0);
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

      if (!session) return;

      try {
        await saveIncomeSource(db, await upsertRemoteIncomeSource(source));
        setSources(await listIncomeSources(db));
      } catch {
        setError("Fonte salva no dispositivo. A sincronização será tentada depois.");
      }
    },
    [addSource, db, session, setSources],
  );

  const saveBalance = useCallback(
    async (nextBalanceCents: number) => {
      await savePiggyBankSettings(db, {
        balanceCents: nextBalanceCents,
        updatedAt: new Date().toISOString(),
        syncStatus: "pending",
      });
      setBalanceCents(nextBalanceCents);

      if (!session) return;

      try {
        const syncedSettings = await upsertRemotePiggyBankSettings(nextBalanceCents);
        await savePiggyBankSettings(db, syncedSettings);
        setBalanceCents(syncedSettings.balanceCents);
      } catch {
        setError("Saldo salvo no dispositivo. A sincronização será tentada depois.");
      }
    },
    [db, session],
  );

  const totalCents = useMemo(() => totalIncomeSources(sources), [sources]);

  return {
    sources,
    totalCents,
    balanceCents,
    formattedTotal: formatCurrencyFromCents(balanceCents),
    balanceLoading,
    loading,
    error,
    createSource,
    saveBalance,
    reload: loadSources,
  };
}
