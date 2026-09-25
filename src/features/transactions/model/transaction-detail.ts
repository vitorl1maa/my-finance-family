import type { Transaction } from "./transaction";

export function getTransactionDetail(transaction: Transaction) {
  const income = transaction.amountCents >= 0;
  return {
    kind: income ? ("income" as const) : ("expense" as const),
    title: transaction.title,
    amountCents: transaction.amountCents,
    fields: income ? ["Valor mensal", "Tipo de fonte"] : ["Categoria", "Vencimento", "Recorrência"],
  };
}
