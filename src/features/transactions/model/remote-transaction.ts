import type { Transaction } from "./transaction";

export type RemoteTransactionRow = {
  id: string;
  account_id: string;
  family_id: string;
  title: string;
  category: string;
  category_id: string | null;
  amount_cents: number;
  occurred_at: string;
  created_at?: string;
  recurrence_rule: string | null;
  payment_method: Transaction["paymentMethod"] | null;
  created_by?: string | null;
  creator_name?: string | null;
  creator_avatar_url?: string | null;
  creator_avatar_seed?: string | null;
};

export function mapRemoteTransaction(row: RemoteTransactionRow): Transaction {
  const transaction: Transaction = {
    id: row.id,
    accountId: row.account_id,
    familyId: row.family_id,
    title: row.title,
    category: row.category,
    categoryId: row.category_id ?? undefined,
    amountCents: row.amount_cents,
    occurredAt: row.occurred_at,
    registeredAt: row.created_at ?? row.occurred_at,
    recurrenceRule: row.recurrence_rule ?? "none",
    syncStatus: "synced",
  };

  if (row.payment_method) transaction.paymentMethod = row.payment_method;
  if (row.created_by) transaction.creatorId = row.created_by;
  if (row.creator_name) transaction.creatorName = row.creator_name;
  if (row.creator_avatar_url) transaction.creatorAvatarUrl = row.creator_avatar_url;
  if (row.creator_avatar_seed) transaction.creatorAvatarSeed = row.creator_avatar_seed;

  return transaction;
}
