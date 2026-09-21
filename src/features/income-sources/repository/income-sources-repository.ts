import type { SQLiteDatabase } from "expo-sqlite";

import type { IncomeSource } from "@/src/features/income-sources/model/income-source";

export type PiggyBankSettings = {
  balanceCents: number;
  updatedAt: string;
};

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

export async function getPiggyBankSettings(db: SQLiteDatabase): Promise<PiggyBankSettings | null> {
  const row = await db.getFirstAsync<{ balance_cents: number; updated_at: string }>(
    `SELECT balance_cents, updated_at
     FROM piggy_bank_settings
     WHERE id = ?`,
    "default",
  );

  return row ? { balanceCents: row.balance_cents, updatedAt: row.updated_at } : null;
}

export async function savePiggyBankSettings(
  db: SQLiteDatabase,
  settings: PiggyBankSettings,
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO piggy_bank_settings (id, balance_cents, updated_at)
     VALUES (?, ?, ?)`,
    "default",
    settings.balanceCents,
    settings.updatedAt,
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
