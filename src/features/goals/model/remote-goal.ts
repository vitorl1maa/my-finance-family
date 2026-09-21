import type { Goal } from "@/src/features/goals/model/goal";

export type RemoteGoalRow = {
  id: string;
  title: string;
  product_url: string | null;
  category: string | null;
  priority: Goal["priority"] | null;
  target_cents: number;
  saved_cents: number;
  due_date: string | null;
};

export function mapRemoteGoal(row: RemoteGoalRow): Goal {
  return {
    id: row.id,
    title: row.title,
    productUrl: row.product_url ?? undefined,
    category: row.category ?? undefined,
    priority: row.priority ?? undefined,
    targetCents: row.target_cents,
    savedCents: row.saved_cents,
    dueDate: row.due_date,
    syncStatus: "synced",
  };
}
