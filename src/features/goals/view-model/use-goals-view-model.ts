import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/src/features/auth/store/auth-store";
import type { Goal } from "@/src/features/goals/model/goal";
import { getGoalStatus, getMonthlyGoalAmount } from "@/src/features/goals/model/goal-details";
import {
  listRemoteGoals,
  upsertRemoteGoal,
} from "@/src/features/goals/repository/goals-remote-repository";
import { listGoals, saveGoal, upsertGoals } from "@/src/features/goals/repository/goals-repository";
import { useGoalsStore } from "@/src/features/goals/store/goals-store";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

export function useGoalsViewModel() {
  const goals = useGoalsStore((state) => state.goals);
  const addGoal = useGoalsStore((state) => state.addGoal);
  const setGoals = useGoalsStore((state) => state.setGoals);
  const db = useSQLiteContext();
  const session = useAuthStore((state) => state.session);
  const referenceDate = useMemo(() => new Date(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let localGoals = await listGoals(db);
      setGoals(localGoals);

      if (!session) return;

      for (const goal of localGoals.filter((item) => item.syncStatus !== "synced")) {
        try {
          await saveGoal(db, await upsertRemoteGoal(goal));
        } catch {
          // Keep the local entry pending so a later session refresh can retry it.
        }
      }

      const remoteGoals = await listRemoteGoals();
      await upsertGoals(db, remoteGoals);
      localGoals = await listGoals(db);
      setGoals(localGoals);
    } catch {
      setError("Não foi possível atualizar as metas agora.");
    } finally {
      setLoading(false);
    }
  }, [db, session, setGoals]);

  useEffect(() => {
    void loadGoals();
  }, [loadGoals]);

  const createGoal = useCallback(
    async (input: Omit<Goal, "id" | "syncStatus">) => {
      const goal: Goal = {
        ...input,
        id: `goal-${Date.now()}`,
        syncStatus: "pending",
      };

      await saveGoal(db, goal);
      addGoal(goal);

      if (!session) return;

      try {
        const syncedGoal = await upsertRemoteGoal(goal);
        await saveGoal(db, syncedGoal);
        setGoals(await listGoals(db));
      } catch {
        setError("Meta salva no dispositivo. A sincronização será tentada depois.");
      }
    },
    [addGoal, db, session, setGoals],
  );

  return useMemo(
    () => ({
      goals: goals.map((goal) => ({
        ...goal,
        category: goal.category ?? "Planejamento",
        priority: goal.priority ?? "Média",
        formattedSaved: formatCurrencyFromCents(goal.savedCents),
        formattedTarget: formatCurrencyFromCents(goal.targetCents),
        formattedRemaining: formatCurrencyFromCents(
          Math.max(0, goal.targetCents - goal.savedCents),
        ),
        formattedMonthlyGoal: goal.dueDate
          ? formatCurrencyFromCents(getMonthlyGoalAmount(goal, referenceDate) ?? 0)
          : "Defina um prazo",
        formattedDueDate: goal.dueDate
          ? format(parseISO(goal.dueDate), "dd MMM yyyy", { locale: ptBR })
          : "Sem prazo",
        progress: Math.min(1, goal.savedCents / goal.targetCents),
        status: getGoalStatus(goal, referenceDate),
      })),
      createGoal,
      error,
      loading,
      reload: loadGoals,
    }),
    [createGoal, error, goals, loadGoals, loading, referenceDate],
  );
}
