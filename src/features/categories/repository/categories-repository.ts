import {
  type ExpenseCategory,
  orderExpenseCategories,
} from "@/src/features/categories/model/expense-category";
import { supabase } from "@/src/shared/supabase/supabase-client";

type CategoryRow = {
  id: string;
  family_id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

export async function listFamilyCategories(): Promise<ExpenseCategory[]> {
  const { data, error } = await supabase.rpc("list_family_categories");

  if (error) {
    throw error;
  }

  return orderExpenseCategories(
    ((data ?? []) as CategoryRow[]).map((row) => ({
      id: row.id,
      familyId: row.family_id,
      name: row.name,
      slug: row.slug,
      isActive: row.is_active,
    })),
  );
}
