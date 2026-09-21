import type { IncomeSource } from "@/src/features/income-sources/model/income-source";

export type RemoteIncomeSourceRow = {
  id: string;
  name: string;
  kind: IncomeSource["kind"];
  amount_cents: number;
  updated_at: string;
};

export function mapRemoteIncomeSource(row: RemoteIncomeSourceRow): IncomeSource {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    amountCents: row.amount_cents,
    updatedAt: row.updated_at,
    syncStatus: "synced",
  };
}
