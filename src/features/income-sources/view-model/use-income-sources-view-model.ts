import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  type IncomeSource,
  totalIncomeSources,
} from "@/src/features/income-sources/model/income-source";
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
  const [loading, setLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceCents, setBalanceCents] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadSources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedSources = await listIncomeSources(db);
      setSources(loadedSources);
      const settings = await getPiggyBankSettings(db);
      setBalanceCents(settings?.balanceCents ?? 0);
    } catch {
      setError("Não foi possível carregar suas fontes de renda.");
    } finally {
      setLoading(false);
      setBalanceLoading(false);
    }
  }, [db, setSources]);

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
    },
    [addSource, db],
  );

  const saveBalance = useCallback(
    async (nextBalanceCents: number) => {
      await savePiggyBankSettings(db, {
        balanceCents: nextBalanceCents,
        updatedAt: new Date().toISOString(),
      });
      setBalanceCents(nextBalanceCents);
    },
    [db],
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
