import type { Account } from "@/src/features/accounts/model/account";
import { supabase } from "@/src/shared/supabase/supabase-client";

type RemoteAccountRow = {
  id: string;
  name: string;
  kind: "checking" | "savings" | "cash" | "credit";
  balance_cents: number;
};

export async function listRemoteAccounts(): Promise<Account[]> {
  const { data, error } = await supabase
    .from("accounts")
    .select("id, name, kind, balance_cents")
    .order("name");

  if (error) throw error;

  return (data as RemoteAccountRow[]).map((account) => ({
    id: account.id,
    name: account.name,
    kind:
      account.kind === "savings" ? "savings" : account.kind === "checking" ? "checking" : "wallet",
    balanceCents: account.balance_cents,
  }));
}
