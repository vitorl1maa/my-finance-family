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
  registered_at?: string;
  recurrence_rule?: string;
  creator_id?: string;
  creator_name?: string;
  creator_avatar_url?: string;
  creator_avatar_seed?: string;
  sync_status: Transaction["syncStatus"];
};

export async function listTransactions(db: SQLiteDatabase): Promise<Transaction[]> {
  const rows = await db.getAllAsync<TransactionRow>(
    `SELECT id, account_id, family_id, title, category, category_id, amount_cents, occurred_at, registered_at, recurrence_rule, sync_status,
       creator_id, creator_name, creator_avatar_url, creator_avatar_seed
     FROM transactions
     ORDER BY registered_at DESC`,
  );

  return rows.map((row) => {
    const transaction: Transaction = {
      id: row.id,
      accountId: row.account_id,
      familyId: row.family_id,
      title: row.title,
      category: row.category,
      categoryId: row.category_id,
      amountCents: row.amount_cents,
      occurredAt: row.occurred_at,
      registeredAt: row.registered_at ?? row.occurred_at,
      recurrenceRule: row.recurrence_rule,
      syncStatus: row.sync_status,
    };
    if (row.creator_id) transaction.creatorId = row.creator_id;
    if (row.creator_name) transaction.creatorName = row.creator_name;
    if (row.creator_avatar_url) transaction.creatorAvatarUrl = row.creator_avatar_url;
    if (row.creator_avatar_seed) transaction.creatorAvatarSeed = row.creator_avatar_seed;
    return transaction;
  });
}

export async function upsertTransactions(
  db: SQLiteDatabase,
  transactions: Transaction[],
): Promise<void> {
  for (const transaction of transactions) {
    await db.runAsync(
      `INSERT INTO transactions (
        id, account_id, family_id, title, category, category_id, amount_cents, occurred_at,
        registered_at, recurrence_rule, sync_status
        , creator_id, creator_name, creator_avatar_url, creator_avatar_seed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        account_id = excluded.account_id,
        family_id = excluded.family_id,
        title = excluded.title,
        category = excluded.category,
        category_id = excluded.category_id,
        amount_cents = excluded.amount_cents,
        occurred_at = excluded.occurred_at,
        registered_at = excluded.registered_at,
        recurrence_rule = excluded.recurrence_rule,
        creator_id = excluded.creator_id,
        creator_name = excluded.creator_name,
        creator_avatar_url = excluded.creator_avatar_url,
        creator_avatar_seed = excluded.creator_avatar_seed,
        sync_status = excluded.sync_status`,
      transaction.id,
      transaction.accountId,
      transaction.familyId ?? null,
      transaction.title,
      transaction.category,
      transaction.categoryId ?? null,
      transaction.amountCents,
      transaction.occurredAt,
      transaction.registeredAt ?? transaction.occurredAt,
      transaction.recurrenceRule ?? "none",
      transaction.syncStatus,
      transaction.creatorId ?? null,
      transaction.creatorName ?? null,
      transaction.creatorAvatarUrl ?? null,
      transaction.creatorAvatarSeed ?? null,
    );
  }
}

export async function replaceTransaction(
  db: SQLiteDatabase,
  previousId: string,
  transaction: Transaction,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await upsertTransactions(db, [transaction]);
    await db.runAsync("DELETE FROM transactions WHERE id = ?", previousId);
  });
}

export async function deleteTransaction(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync("DELETE FROM transactions WHERE id = ?", id);
}
