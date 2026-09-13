import type { SQLiteDatabase } from "expo-sqlite";

import type { Transaction } from "@/src/features/transactions/model/transaction";

type TransactionRow = {
  id: string;
  account_id: string;
  title: string;
  category: string;
  amount_cents: number;
  occurred_at: string;
  sync_status: Transaction["syncStatus"];
};

export async function listTransactions(
  db: SQLiteDatabase,
): Promise<Transaction[]> {
  const rows = await db.getAllAsync<TransactionRow>(
    `SELECT id, account_id, title, category, amount_cents, occurred_at, sync_status
     FROM transactions
     ORDER BY occurred_at DESC`,
  );

  return rows.map((row) => ({
    id: row.id,
    accountId: row.account_id,
    title: row.title,
    category: row.category,
    amountCents: row.amount_cents,
    occurredAt: row.occurred_at,
    syncStatus: row.sync_status,
  }));
}
