import type { SQLiteDatabase } from "expo-sqlite";

import type { WalletSettings } from "@/src/features/wallet/model/wallet";

type WalletSettingsRow = {
  balance_cents: number;
  updated_at: string;
  sync_status: WalletSettings["syncStatus"];
};

export async function getWalletSettings(db: SQLiteDatabase): Promise<WalletSettings | null> {
  const row = await db.getFirstAsync<WalletSettingsRow>(
    `SELECT balance_cents, updated_at, sync_status
     FROM wallet_settings
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

export async function saveWalletSettings(
  db: SQLiteDatabase,
  settings: WalletSettings,
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO wallet_settings (id, balance_cents, updated_at, sync_status)
     VALUES (?, ?, ?, ?)`,
    "default",
    settings.balanceCents,
    settings.updatedAt,
    settings.syncStatus,
  );
}
