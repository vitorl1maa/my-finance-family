import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo } from "react";

import { getGoalStatus, getMonthlyGoalAmount } from "@/src/features/goals/model/goal-details";
import { useGoalsStore } from "@/src/features/goals/store/goals-store";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

export function useGoalsViewModel() {
  const goals = useGoalsStore((state) => state.goals);
  const referenceDate = useMemo(() => new Date(), []);

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
    }),
    [goals, referenceDate],
  );
}
