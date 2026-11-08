import { addMonths } from "date-fns";

export type CreditCardInstallment = { amountCents: number; dueDate: Date };

export function getCreditCardInstallmentLabel(
  purchaseDate: string | undefined,
  installmentCount: number | undefined,
  installmentCents: number,
  dueDate: string,
): string | undefined {
  if (!purchaseDate || !installmentCount) return undefined;
  const installments = getCreditCardInstallments(
    new Date(purchaseDate),
    Math.abs(installmentCents) * installmentCount,
    installmentCount,
  );
  const index = installments.findIndex(
    (item) => item.dueDate.toISOString().slice(0, 10) === dueDate.slice(0, 10),
  );
  return index >= 0 ? `Parcela ${index + 1} de ${installmentCount}` : undefined;
}

export function getCreditCardInstallments(
  purchaseDate: Date,
  totalCents: number,
  installmentCount: number,
): CreditCardInstallment[] {
  if (!Number.isInteger(totalCents) || totalCents <= 0) throw new Error("Valor inválido");
  if (!Number.isInteger(installmentCount) || installmentCount < 1) {
    throw new Error("Quantidade de parcelas inválida");
  }

  const firstDueDate = getFirstDueDate(purchaseDate);
  const baseAmount = Math.floor(totalCents / installmentCount);
  const remainder = totalCents % installmentCount;

  return Array.from({ length: installmentCount }, (_, index) => ({
    amountCents: baseAmount + (index < remainder ? 1 : 0),
    dueDate: addMonths(firstDueDate, index),
  }));
}

function getFirstDueDate(purchaseDate: Date): Date {
  const closingDate = getLastBusinessDay(purchaseDate.getFullYear(), purchaseDate.getMonth());
  const dueMonth = purchaseDate <= closingDate ? 1 : 2;
  return new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + dueMonth, 8, 12);
}

function getLastBusinessDay(year: number, month: number): Date {
  const date = new Date(year, month + 1, 0, 12);
  while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() - 1);
  return date;
}
