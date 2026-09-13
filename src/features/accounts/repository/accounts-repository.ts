import type { SQLiteDatabase } from "expo-sqlite";

import type { Account } from "@/src/features/accounts/model/account";

type AccountRow = {
  id: string;
  name: string;
  kind: Account["kind"];
  balance_cents: number;
};

export async function listAccounts(db: SQLiteDatabase): Promise<Account[]> {
  const rows = await db.getAllAsync<AccountRow>(
    "SELECT id, name, kind, balance_cents FROM accounts ORDER BY name ASC",
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    kind: row.kind,
    balanceCents: row.balance_cents,
  }));
}
