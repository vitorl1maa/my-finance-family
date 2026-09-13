import { useMemo } from "react";

import { useGoalsStore } from "@/src/features/goals/store/goals-store";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

export function useGoalsViewModel() {
  const goals = useGoalsStore((state) => state.goals);

  return useMemo(
    () => ({
      goals: goals.map((goal) => ({
        ...goal,
        formattedSaved: formatCurrencyFromCents(goal.savedCents),
        formattedTarget: formatCurrencyFromCents(goal.targetCents),
        progress: goal.savedCents / goal.targetCents,
      })),
    }),
    [goals],
  );
}
