import type { SQLiteDatabase } from "expo-sqlite";

import type { Goal } from "@/src/features/goals/model/goal";

type GoalRow = {
  id: string;
  title: string;
  product_url: string | null;
  category: string | null;
  priority: Goal["priority"] | null;
  target_cents: number;
  saved_cents: number;
  due_date: string | null;
  sync_status: Goal["syncStatus"];
};

export async function listGoals(db: SQLiteDatabase): Promise<Goal[]> {
  const rows = await db.getAllAsync<GoalRow>(
    `SELECT id, title, product_url, category, priority, target_cents, saved_cents, due_date, sync_status
     FROM goals
     ORDER BY title ASC`,
  );

  return rows.map(toGoal);
}

export async function saveGoal(db: SQLiteDatabase, goal: Goal): Promise<void> {
  await db.runAsync(
    `INSERT INTO goals (
      id, title, product_url, category, priority, target_cents, saved_cents, due_date, sync_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      product_url = excluded.product_url,
      category = excluded.category,
      priority = excluded.priority,
      target_cents = excluded.target_cents,
      saved_cents = excluded.saved_cents,
      due_date = excluded.due_date,
      sync_status = excluded.sync_status`,
    goal.id,
    goal.title,
    goal.productUrl ?? null,
    goal.category ?? null,
    goal.priority ?? null,
    goal.targetCents,
    goal.savedCents,
    goal.dueDate,
    goal.syncStatus,
  );
}

export async function upsertGoals(db: SQLiteDatabase, goals: Goal[]): Promise<void> {
  for (const goal of goals) {
    await saveGoal(db, goal);
  }
}

function toGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    title: row.title,
    productUrl: row.product_url ?? undefined,
    category: row.category ?? undefined,
    priority: row.priority ?? undefined,
    targetCents: row.target_cents,
    savedCents: row.saved_cents,
    dueDate: row.due_date,
    syncStatus: row.sync_status,
  };
}
