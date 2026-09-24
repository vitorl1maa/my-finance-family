import { supabase } from "../../../shared/supabase/supabase-client";
import type { CreateExpensePayload } from "../model/expense-payload";
import { mapRemoteTransaction, type RemoteTransactionRow } from "../model/remote-transaction";
import type { Transaction } from "../model/transaction";

export async function listRemoteTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase.rpc("list_family_transactions");

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

  const transaction = (await listRemoteTransactions()).find(
    (item) => item.id === result.transaction_id,
  );
  if (!transaction) throw new Error("Não foi possível carregar a despesa salva.");
  return transaction;
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
  const { data, error } = await supabase.rpc("update_family_expense", {
    expense_id: transaction.id,
    expense_title: transaction.title,
    expense_category_id: transaction.categoryId,
    expense_amount_cents: Math.abs(transaction.amountCents),
    expense_occurred_at: transaction.occurredAt,
    expense_recurrence_rule: transaction.recurrenceRule ?? "none",
  });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.transaction_id) throw new Error("Não foi possível confirmar a despesa atualizada.");
  const updated = (await listRemoteTransactions()).find(
    (item) => item.id === result.transaction_id,
  );
  if (!updated) throw new Error("Não foi possível carregar a despesa atualizada.");
  return updated;
}

export async function deleteRemoteExpense(id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_family_expense", { expense_id: id });
  if (error) throw error;
}
