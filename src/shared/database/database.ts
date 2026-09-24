import type { SQLiteDatabase } from "expo-sqlite";

export const databaseName = "my-finance-family.db";

const databaseVersion = 8;

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

      PRAGMA user_version = 1;
    `);
  }

  if (currentVersion < 2) {
    await db.execAsync(`
      ALTER TABLE transactions ADD COLUMN family_id TEXT;
      ALTER TABLE transactions ADD COLUMN category_id TEXT;
      PRAGMA user_version = ${databaseVersion};
    `);
  }

  if (currentVersion < 3) {
    await db.execAsync(`
      ALTER TABLE transactions ADD COLUMN recurrence_rule TEXT NOT NULL DEFAULT 'none';
      PRAGMA user_version = ${databaseVersion};
    `);
  }

  if (currentVersion < 4) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS income_sources (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        kind TEXT NOT NULL,
        amount_cents INTEGER NOT NULL,
        updated_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending'
      );
      PRAGMA user_version = ${databaseVersion};
    `);
  }

  if (currentVersion < 5) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS piggy_bank_settings (
        id TEXT PRIMARY KEY NOT NULL,
        balance_cents INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      );
      PRAGMA user_version = ${databaseVersion};
    `);
  }

  if (currentVersion < 6) {
    await db.execAsync(`
      ALTER TABLE goals ADD COLUMN product_url TEXT;
      ALTER TABLE goals ADD COLUMN category TEXT;
      ALTER TABLE goals ADD COLUMN priority TEXT;
      ALTER TABLE piggy_bank_settings ADD COLUMN sync_status TEXT NOT NULL DEFAULT 'pending';
      PRAGMA user_version = ${databaseVersion};
    `);
  }

  if (currentVersion < 7) {
    await db.execAsync(`
      DELETE FROM income_sources
      WHERE id IN ('default-salary', 'default-investments');
      PRAGMA user_version = ${databaseVersion};
    `);
  }

  if (currentVersion < 8) {
    await db.execAsync(`
      ALTER TABLE transactions ADD COLUMN registered_at TEXT;
      UPDATE transactions
      SET registered_at = occurred_at
      WHERE registered_at IS NULL;
      PRAGMA user_version = ${databaseVersion};
    `);
  }
}
