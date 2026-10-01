import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Transaction } from "@/src/features/transactions/model/transaction";

export function getExpenseMonthLabel(referenceDate: Date = new Date()): string {
  return `SUAS DESPESAS DE ${format(referenceDate, "MMMM", { locale: ptBR }).toLocaleUpperCase("pt-BR")}`;
}

export function getExpenseTotalForMonth(
  transactions: Transaction[],
  referenceDate: Date = new Date(),
): number {
  return transactions.reduce((total, transaction) => {
    const isExpense = transaction.amountCents < 0;
    const paidAt = transaction.paidAt ? new Date(transaction.paidAt) : undefined;
    const isReferenceMonth =
      paidAt?.getFullYear() === referenceDate.getFullYear() &&
      paidAt?.getMonth() === referenceDate.getMonth();

    return isExpense && transaction.paymentStatus === "paid" && isReferenceMonth
      ? total + Math.abs(transaction.amountCents)
      : total;
  }, 0);
}
