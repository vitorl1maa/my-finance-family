import type { IncomeSource } from "@/src/features/income-sources/model/income-source";

export type RemoteIncomeSourceRow = {
  id: string;
  name: string;
  kind: IncomeSource["kind"];
  amount_cents: number;
  updated_at: string;
  created_by?: string | null;
  creator_name?: string | null;
  creator_avatar_url?: string | null;
  creator_avatar_seed?: string | null;
};

export function mapRemoteIncomeSource(row: RemoteIncomeSourceRow): IncomeSource {
  const source: IncomeSource = {
    id: row.id,
    name: row.name,
    kind: row.kind,
    amountCents: row.amount_cents,
    updatedAt: row.updated_at,
    syncStatus: "synced",
  };
  if (row.created_by) source.creatorId = row.created_by;
  if (row.creator_name) source.creatorName = row.creator_name;
  if (row.creator_avatar_url) source.creatorAvatarUrl = row.creator_avatar_url;
  if (row.creator_avatar_seed) source.creatorAvatarSeed = row.creator_avatar_seed;
  return source;
}
