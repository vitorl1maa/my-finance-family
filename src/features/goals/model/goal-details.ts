import { differenceInCalendarMonths, isBefore, parseISO } from "date-fns";

type GoalProgress = {
  targetCents: number;
  savedCents: number;
  dueDate: string | null;
};

export function getMonthsUntilGoal(dueDate: string | null, referenceDate: Date): number | null {
  if (!dueDate) return null;

  return Math.max(1, differenceInCalendarMonths(parseISO(dueDate), referenceDate));
}

export function getMonthlyGoalAmount(goal: GoalProgress, referenceDate: Date): number | null {
  const remainingCents = Math.max(0, goal.targetCents - goal.savedCents);
  const months = getMonthsUntilGoal(goal.dueDate, referenceDate);

  if (months === null || remainingCents === 0) return remainingCents;

  return Math.ceil(remainingCents / months);
}

export function getGoalStatus(
  goal: GoalProgress,
  referenceDate: Date,
): "Concluída" | "No ritmo" | "Atenção" {
  if (goal.savedCents >= goal.targetCents) return "Concluída";
  if (goal.dueDate && !isBefore(referenceDate, parseISO(goal.dueDate))) return "Atenção";

  return "No ritmo";
}
