import type { IncomeSource } from "@/src/features/income-sources/model/income-source";
import {
  mapRemoteIncomeSource,
  type RemoteIncomeSourceRow,
} from "@/src/features/income-sources/model/remote-income-source";
import {
  mapRemotePiggyBankSettings,
  type RemotePiggyBankSettingsRow,
} from "@/src/features/income-sources/model/remote-piggy-bank-settings";
import type { PiggyBankSettings } from "@/src/features/income-sources/repository/income-sources-repository";
import { supabase } from "@/src/shared/supabase/supabase-client";

export async function listRemoteIncomeSources(): Promise<IncomeSource[]> {
  const { data, error } = await supabase.rpc("list_family_income_sources");

  if (error) throw error;

  return ((data ?? []) as RemoteIncomeSourceRow[]).map(mapRemoteIncomeSource);
}

export async function upsertRemoteIncomeSource(source: IncomeSource): Promise<IncomeSource> {
  const { data, error } = await supabase.rpc("upsert_family_income_source", {
    client_id: source.id,
    source_name: source.name,
    source_kind: source.kind,
    source_amount_cents: source.amountCents,
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Não foi possível confirmar a fonte de renda salva.");

  return mapRemoteIncomeSource(row as RemoteIncomeSourceRow);
}

export async function deleteRemoteIncomeSource(id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_family_income_source", { client_id: id });
  if (error) throw error;
}

export async function getRemotePiggyBankSettings(): Promise<PiggyBankSettings | null> {
  const { data, error } = await supabase.rpc("get_family_piggy_bank_settings");

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  return row ? mapRemotePiggyBankSettings(row as RemotePiggyBankSettingsRow) : null;
}

export async function upsertRemotePiggyBankSettings(
  balanceCents: number,
): Promise<PiggyBankSettings> {
  const { data, error } = await supabase.rpc("upsert_family_piggy_bank_settings", {
    next_balance_cents: balanceCents,
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Não foi possível confirmar o saldo salvo.");

  return mapRemotePiggyBankSettings(row as RemotePiggyBankSettingsRow);
}
