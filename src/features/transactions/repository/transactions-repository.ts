import type { SQLiteDatabase } from "expo-sqlite";

import type { Transaction } from "@/src/features/transactions/model/transaction";

type TransactionRow = {
  id: string;
  account_id: string;
  family_id?: string;
  title: string;
  category: string;
  category_id?: string;
  amount_cents: number;
  occurred_at: string;
  recurrence_rule?: string;
  sync_status: Transaction["syncStatus"];
};

export async function listTransactions(db: SQLiteDatabase): Promise<Transaction[]> {
  const rows = await db.getAllAsync<TransactionRow>(
    `SELECT id, account_id, family_id, title, category, category_id, amount_cents, occurred_at, recurrence_rule, sync_status
     FROM transactions
     ORDER BY occurred_at DESC`,
  );

  return rows.map((row) => ({
    id: row.id,
    accountId: row.account_id,
    familyId: row.family_id,
    title: row.title,
    category: row.category,
    categoryId: row.category_id,
    amountCents: row.amount_cents,
    occurredAt: row.occurred_at,
    recurrenceRule: row.recurrence_rule,
    syncStatus: row.sync_status,
  }));
}
