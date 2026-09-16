export function getDashboardGreeting(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour < 12) return "Bom dia,";
  if (hour < 18) return "Boa tarde,";
  return "Boa noite,";
}

export function getUserDisplayName(metadata: Record<string, unknown> | null | undefined): string {
  const firstName = metadata?.first_name;

  if (typeof firstName === "string" && firstName.trim()) return firstName.trim();
  return "Usuário";
}
