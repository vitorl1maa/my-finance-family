import type { PiggyBankSettings } from "@/src/features/income-sources/repository/income-sources-repository";

export type RemotePiggyBankSettingsRow = {
  balance_cents: number;
  updated_at: string;
};

export function mapRemotePiggyBankSettings(row: RemotePiggyBankSettingsRow): PiggyBankSettings {
  return {
    balanceCents: row.balance_cents,
    updatedAt: row.updated_at,
    syncStatus: "synced",
  };
}
