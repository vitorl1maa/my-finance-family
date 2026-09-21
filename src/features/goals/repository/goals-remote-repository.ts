import type { Goal } from "@/src/features/goals/model/goal";
import { mapRemoteGoal, type RemoteGoalRow } from "@/src/features/goals/model/remote-goal";
import { supabase } from "@/src/shared/supabase/supabase-client";

export async function listRemoteGoals(): Promise<Goal[]> {
  const { data, error } = await supabase.rpc("list_family_goals");

  if (error) throw error;

  return ((data ?? []) as RemoteGoalRow[]).map(mapRemoteGoal);
}

export async function upsertRemoteGoal(goal: Goal): Promise<Goal> {
  const { data, error } = await supabase.rpc("upsert_family_goal", {
    client_id: goal.id,
    goal_title: goal.title,
    goal_product_url: goal.productUrl ?? "",
    goal_category: goal.category ?? "",
    goal_priority: goal.priority ?? null,
    goal_target_cents: goal.targetCents,
    goal_saved_cents: goal.savedCents,
    goal_due_date: goal.dueDate,
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Não foi possível confirmar a meta salva.");

  return mapRemoteGoal(row as RemoteGoalRow);
}
