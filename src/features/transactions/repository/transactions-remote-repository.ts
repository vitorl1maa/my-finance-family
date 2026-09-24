import { supabase } from "../../../shared/supabase/supabase-client";
import type { CreateExpensePayload } from "../model/expense-payload";
import { mapRemoteTransaction, type RemoteTransactionRow } from "../model/remote-transaction";
import type { Transaction } from "../model/transaction";

const transactionColumns =
  "id, account_id, family_id, title, category, category_id, amount_cents, occurred_at, created_at, recurrence_rule";

export async function listRemoteTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select(transactionColumns)
    .order("created_at", { ascending: false });

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

export async function syncRemoteExpense(transaction: Transaction): Promise<Transaction> {
  if (!transaction.categoryId || transaction.amountCents >= 0) {
    throw new Error("A transação pendente não é uma despesa sincronizável.");
  }

  return createRemoteExpense({
    title: transaction.title,
    categoryId: transaction.categoryId,
    amountCents: Math.abs(transaction.amountCents),
    occurredAt: transaction.occurredAt,
    recurrenceRule: transaction.recurrenceRule ?? "none",
  });
}

export async function updateRemoteExpense(transaction: Transaction): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .update({
      title: transaction.title,
      category: transaction.category,
      category_id: transaction.categoryId,
      amount_cents: transaction.amountCents,
      occurred_at: transaction.occurredAt,
      recurrence_rule: transaction.recurrenceRule ?? "none",
    })
    .eq("id", transaction.id)
    .select(transactionColumns)
    .single();
  if (error) throw error;
  return mapRemoteTransaction(data as RemoteTransactionRow);
}

export async function deleteRemoteExpense(id: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}
