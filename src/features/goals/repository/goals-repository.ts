import type { SQLiteDatabase } from "expo-sqlite";

import type { Goal } from "@/src/features/goals/model/goal";

type GoalRow = {
  id: string;
  title: string;
  target_cents: number;
  saved_cents: number;
  due_date: string | null;
  sync_status: Goal["syncStatus"];
};

export async function listGoals(db: SQLiteDatabase): Promise<Goal[]> {
  const rows = await db.getAllAsync<GoalRow>(
    `SELECT id, title, target_cents, saved_cents, due_date, sync_status
     FROM goals
     ORDER BY title ASC`,
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    targetCents: row.target_cents,
    savedCents: row.saved_cents,
    dueDate: row.due_date,
    syncStatus: row.sync_status,
  }));
}
