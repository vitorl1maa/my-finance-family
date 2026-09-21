import type { SQLiteDatabase } from "expo-sqlite";

import type { IncomeSource } from "@/src/features/income-sources/model/income-source";

type IncomeSourceRow = {
  id: string;
  name: string;
  kind: IncomeSource["kind"];
  amount_cents: number;
  updated_at: string;
  sync_status: IncomeSource["syncStatus"];
};

export async function listIncomeSources(db: SQLiteDatabase): Promise<IncomeSource[]> {
  const rows = await db.getAllAsync<IncomeSourceRow>(
    `SELECT id, name, kind, amount_cents, updated_at, sync_status
     FROM income_sources
     ORDER BY name ASC`,
  );

  return rows.map(toIncomeSource);
}

export async function saveIncomeSource(db: SQLiteDatabase, source: IncomeSource): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO income_sources
      (id, name, kind, amount_cents, updated_at, sync_status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    source.id,
    source.name,
    source.kind,
    source.amountCents,
    source.updatedAt,
    source.syncStatus,
  );
}

function toIncomeSource(row: IncomeSourceRow): IncomeSource {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    amountCents: row.amount_cents,
    updatedAt: row.updated_at,
    syncStatus: row.sync_status,
  };
}
