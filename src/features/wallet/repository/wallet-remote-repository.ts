import { supabase } from "@/src/shared/supabase/supabase-client";

type RemoteWalletRow = {
  balance_cents: number;
  updated_at: string;
};

type RemoteTransferRow = {
  wallet_balance_cents: number;
  piggy_bank_balance_cents: number;
};

export async function getRemoteWalletSettings(): Promise<RemoteWalletRow | null> {
  const { data, error } = await supabase.rpc("get_family_wallet_settings");
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row ? (row as RemoteWalletRow) : null;
}

export async function transferRemoteWallet(
  direction: "to_piggy_bank" | "from_piggy_bank",
  amountCents: number,
): Promise<RemoteTransferRow> {
  const { data, error } = await supabase.rpc("transfer_family_wallet", {
    transfer_direction: direction,
    transfer_amount_cents: amountCents,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Não foi possível confirmar a transferência.");
  return row as RemoteTransferRow;
}

export async function resetRemoteWalletBalance(
  target: "wallet" | "piggy_bank",
): Promise<RemoteTransferRow> {
  const { data, error } = await supabase.rpc("reset_family_wallet_balance", {
    balance_target: target,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Não foi possível confirmar o saldo zerado.");
  return row as RemoteTransferRow;
}
