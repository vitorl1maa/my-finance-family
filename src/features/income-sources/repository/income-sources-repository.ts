import type { SQLiteDatabase } from "expo-sqlite";

import type { IncomeSource } from "@/src/features/income-sources/model/income-source";

export type PiggyBankSettings = {
  balanceCents: number;
  updatedAt: string;
  syncStatus: "pending" | "synced" | "failed";
};

type IncomeSourceRow = {
  id: string;
  name: string;
  kind: IncomeSource["kind"];
  amount_cents: number;
  updated_at: string;
  sync_status: IncomeSource["syncStatus"];
  creator_id?: string;
  creator_name?: string;
  creator_avatar_url?: string;
  creator_avatar_seed?: string;
};

export async function listIncomeSources(db: SQLiteDatabase): Promise<IncomeSource[]> {
  const rows = await db.getAllAsync<IncomeSourceRow>(
    `SELECT id, name, kind, amount_cents, updated_at, sync_status,
       creator_id, creator_name, creator_avatar_url, creator_avatar_seed
     FROM income_sources
     ORDER BY name ASC`,
  );

  return rows.map(toIncomeSource);
}

export async function saveIncomeSource(db: SQLiteDatabase, source: IncomeSource): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO income_sources
      (id, name, kind, amount_cents, updated_at, sync_status,
       creator_id, creator_name, creator_avatar_url, creator_avatar_seed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    source.id,
    source.name,
    source.kind,
    source.amountCents,
    source.updatedAt,
    source.syncStatus,
    source.creatorId ?? null,
    source.creatorName ?? null,
    source.creatorAvatarUrl ?? null,
    source.creatorAvatarSeed ?? null,
  );
}

export async function deleteIncomeSource(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync("DELETE FROM income_sources WHERE id = ?", id);
}

export async function getPiggyBankSettings(db: SQLiteDatabase): Promise<PiggyBankSettings | null> {
  const row = await db.getFirstAsync<{
    balance_cents: number;
    updated_at: string;
    sync_status: PiggyBankSettings["syncStatus"];
  }>(
    `SELECT balance_cents, updated_at, sync_status
     FROM piggy_bank_settings
     WHERE id = ?`,
    "default",
  );

  return row
    ? {
        balanceCents: row.balance_cents,
        updatedAt: row.updated_at,
        syncStatus: row.sync_status,
      }
    : null;
}

export async function savePiggyBankSettings(
  db: SQLiteDatabase,
  settings: PiggyBankSettings,
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO piggy_bank_settings (id, balance_cents, updated_at, sync_status)
     VALUES (?, ?, ?, ?)`,
    "default",
    settings.balanceCents,
    settings.updatedAt,
    settings.syncStatus,
  );
}

function toIncomeSource(row: IncomeSourceRow): IncomeSource {
  const source: IncomeSource = {
    id: row.id,
    name: row.name,
    kind: row.kind,
    amountCents: row.amount_cents,
    updatedAt: row.updated_at,
    syncStatus: row.sync_status,
  };
  if (row.creator_id) source.creatorId = row.creator_id;
  if (row.creator_name) source.creatorName = row.creator_name;
  if (row.creator_avatar_url) source.creatorAvatarUrl = row.creator_avatar_url;
  if (row.creator_avatar_seed) source.creatorAvatarSeed = row.creator_avatar_seed;
  return source;
}
