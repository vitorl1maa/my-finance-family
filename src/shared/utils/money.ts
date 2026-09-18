export function formatCurrencyFromCents(valueInCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(valueInCents / 100);
}

export function formatBrlInput(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return formatCurrencyFromCents(Number(digits)).replace(/\u00a0/g, " ");
}

export function parseBrlInputToCents(value: string): number {
  const digits = value.replace(/\D/g, "");

  return digits ? Number(digits) : 0;
}
