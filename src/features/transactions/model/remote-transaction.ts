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
  recurrence_rule: string | null;
};

export function mapRemoteTransaction(row: RemoteTransactionRow): Transaction {
  return {
    id: row.id,
    accountId: row.account_id,
    familyId: row.family_id,
    title: row.title,
    category: row.category,
    categoryId: row.category_id ?? undefined,
    amountCents: row.amount_cents,
    occurredAt: row.occurred_at,
    recurrenceRule: row.recurrence_rule ?? "none",
    syncStatus: "synced",
  };
}
