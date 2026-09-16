import type { SQLiteDatabase } from "expo-sqlite";

export const databaseName = "my-finance-family.db";

const databaseVersion = 1;

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= databaseVersion) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        kind TEXT NOT NULL,
        balance_cents INTEGER NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        account_id TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        amount_cents INTEGER NOT NULL,
        occurred_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending'
      );

      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        target_cents INTEGER NOT NULL,
        saved_cents INTEGER NOT NULL,
        due_date TEXT,
        sync_status TEXT NOT NULL DEFAULT 'pending'
      );

      PRAGMA user_version = ${databaseVersion};
    `);
  }
}
