import { supabase } from "../../../shared/supabase/supabase-client";
import type { CreateExpensePayload } from "../model/expense-payload";
import { mapRemoteTransaction, type RemoteTransactionRow } from "../model/remote-transaction";
import type { Transaction } from "../model/transaction";

const transactionColumns =
  "id, account_id, family_id, title, category, category_id, amount_cents, occurred_at, recurrence_rule";

export async function listRemoteTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select(transactionColumns)
    .order("occurred_at", { ascending: false });

  if (error) throw error;

  return (data as RemoteTransactionRow[]).map(mapRemoteTransaction);
}

export async function createRemoteExpense(payload: CreateExpensePayload): Promise<Transaction> {
  const { data, error } = await supabase.rpc("create_expense", {
    expense_title: payload.title,
    expense_category_id: payload.categoryId,
    expense_amount_cents: payload.amountCents,
    expense_occurred_at: payload.occurredAt,
    expense_recurrence_rule: payload.recurrenceRule,
  });

  if (error) throw error;

  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.transaction_id) throw new Error("Não foi possível confirmar a transação salva.");

  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .select(transactionColumns)
    .eq("id", result.transaction_id)
    .single();

  if (transactionError) throw transactionError;

  return mapRemoteTransaction(transaction as RemoteTransactionRow);
}
