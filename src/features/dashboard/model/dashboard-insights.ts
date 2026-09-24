import type { Transaction } from "@/src/features/transactions/model/transaction";
import {
  getExpenseOccurrencesForMonth,
  getNextExpenseOccurrence,
  type ExpenseOccurrence,
  // @ts-expect-error Node's native TypeScript test runner requires the source extension here.
} from "./expense-occurrences.ts";

type WeekDay = {
  date: number;
  isoDate: string;
  shortWeekday: string;
  isSelected: boolean;
  isCurrentMonth: boolean;
};

type CategoryTotal = { category: string; amountCents: number };

type WeeklyCashflow = {
  label: string;
  incomeCents: number;
  expenseCents: number;
};

export type DashboardInsights = {
  monthlyIncomeCents: number;
  monthlyExpenseCents: number;
  expenseByCategory: CategoryTotal[];
  weeklyCashflow: WeeklyCashflow[];
  healthStatus: "Boa" | "Atenção" | "Crítica";
  healthMessage: string;
  scheduledExpenses: ExpenseOccurrence[];
  nextExpense?: ExpenseOccurrence;
};

const weekdayLabels = ["S", "T", "Q", "Q", "S", "S", "D"];

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function isSameMonth(date: Date, reference: Date): boolean {
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
}

export function getWeekDays(selectedDate: Date): WeekDay[] {
  const start = new Date(selectedDate);
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);

  return weekdayLabels.map((shortWeekday, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      date: date.getDate(),
      isoDate: toDateKey(date),
      shortWeekday,
      isSelected: toDateKey(date) === toDateKey(selectedDate),
      isCurrentMonth: date.getMonth() === selectedDate.getMonth(),
    };
  });
}

export function getCalendarWeeks(selectedDate: Date): WeekDay[][] {
  const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const start = new Date(monthStart);
  start.setDate(monthStart.getDate() - ((monthStart.getDay() + 6) % 7));

  const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  const end = new Date(monthEnd);
  end.setDate(monthEnd.getDate() + (6 - ((monthEnd.getDay() + 6) % 7)));

  const days: WeekDay[] = [];
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    days.push({
      date: date.getDate(),
      isoDate: toDateKey(date),
      shortWeekday: weekdayLabels[(date.getDay() + 6) % 7],
      isSelected: toDateKey(date) === toDateKey(selectedDate),
      isCurrentMonth: date.getMonth() === selectedDate.getMonth(),
    });
  }

  return Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7));
}

export function buildDashboardInsights(
  transactions: Transaction[],
  referenceDate: Date = new Date(),
): DashboardInsights {
  const monthTransactions = transactions.filter((transaction) =>
    isSameMonth(new Date(transaction.occurredAt), referenceDate),
  );
  const categoryTotals = new Map<string, number>();
  const weeklyTotals = Array.from({ length: 5 }, (_, index) => ({
    label: String(index * 7 + 1).padStart(2, "0"),
    incomeCents: 0,
    expenseCents: 0,
  }));

  let monthlyIncomeCents = 0;
  let monthlyExpenseCents = 0;

  for (const transaction of monthTransactions) {
    const amount = transaction.amountCents;
    const transactionDate = new Date(transaction.occurredAt);
    const weekIndex = Math.min(4, Math.floor((transactionDate.getDate() - 1) / 7));

    if (amount >= 0) {
      monthlyIncomeCents += amount;
      weeklyTotals[weekIndex].incomeCents += amount;
      continue;
    }

    const expenseCents = Math.abs(amount);
    monthlyExpenseCents += expenseCents;
    weeklyTotals[weekIndex].expenseCents += expenseCents;
    categoryTotals.set(
      transaction.category,
      (categoryTotals.get(transaction.category) ?? 0) + expenseCents,
    );
  }

  const expenseByCategory = [...categoryTotals.entries()]
    .map(([category, amountCents]) => ({ category, amountCents }))
    .sort((left, right) => right.amountCents - left.amountCents);
  const healthStatus = getHealthStatus(monthlyIncomeCents, monthlyExpenseCents);
  const expenseTransactions = transactions.filter((transaction) => transaction.amountCents < 0);
  const scheduledExpenses = expenseTransactions
    .flatMap((expense) => getExpenseOccurrencesForMonth(expense, referenceDate))
    .sort((left, right) => left.dateKey.localeCompare(right.dateKey));
  const nextExpense = getNextExpenseOccurrence(expenseTransactions, referenceDate);

  return {
    monthlyIncomeCents,
    monthlyExpenseCents,
    expenseByCategory,
    weeklyCashflow: weeklyTotals,
    healthStatus,
    healthMessage: getHealthMessage(healthStatus),
    scheduledExpenses,
    nextExpense,
  };
}

function getHealthStatus(
  incomeCents: number,
  expenseCents: number,
): DashboardInsights["healthStatus"] {
  if (incomeCents === 0 || expenseCents > incomeCents) return "Crítica";
  if (expenseCents > incomeCents * 0.8) return "Atenção";
  return "Boa";
}

function getHealthMessage(status: DashboardInsights["healthStatus"]): string {
  if (status === "Crítica") return "Suas despesas estão maiores que suas entradas.";
  if (status === "Atenção") return "Suas despesas estão próximas do total que entrou.";
  return "Você gastou menos do que entrou este mês.";
}
