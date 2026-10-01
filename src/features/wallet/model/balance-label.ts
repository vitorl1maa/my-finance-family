import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function getBalanceMonthLabel(
  balance: "wallet" | "piggy_bank",
  referenceDate: Date = new Date(),
): string {
  const subject = balance === "wallet" ? "CARTEIRA" : "COFRINHO";
  const article = balance === "wallet" ? "DA" : "DO";
  const month = format(referenceDate, "MMMM", { locale: ptBR }).toLocaleUpperCase("pt-BR");

  return `SALDO ${article} ${subject} EM ${month}`;
}
