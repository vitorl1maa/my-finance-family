import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Transaction } from "@/src/features/transactions/model/transaction";
import {
  type ExpenseOccurrence,
  getExpenseOccurrencesForMonth,
  getNextExpenseOccurrence,
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

export type MonthlyCashflow = {
  label: string;
  month: Date;
  incomeCents: number;
  expenseCents: number;
};

export type SelectedDayExpenseSummary = {
  totalCents: number;
  paidCount: number;
  pendingCount: number;
};

export function getSelectedDayExpenseSummary(
  expenses: ExpenseOccurrence[],
): SelectedDayExpenseSummary {
  return expenses.reduce<SelectedDayExpenseSummary>(
    (summary, expense) => ({
      totalCents: summary.totalCents + Math.abs(expense.amountCents),
      paidCount: summary.paidCount + (expense.paymentStatus === "paid" ? 1 : 0),
      pendingCount: summary.pendingCount + (expense.paymentStatus === "paid" ? 0 : 1),
    }),
    { totalCents: 0, paidCount: 0, pendingCount: 0 },
  );
}

export function hasExpensesOnDate(expenses: ExpenseOccurrence[], dateKey: string): boolean {
  return expenses.some((expense) => expense.dateKey === dateKey);
}

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

export function buildMonthlyCashflow(
  transactions: Transaction[],
  endDate: Date = new Date(),
  months = 6,
): MonthlyCashflow[] {
  const start = new Date(endDate.getFullYear(), endDate.getMonth() - months + 1, 1);
  const result = Array.from({ length: months }, (_, index) => {
    const month = new Date(start.getFullYear(), start.getMonth() + index, 1);
    return {
      label: format(month, "MMM", { locale: ptBR }),
      month,
      incomeCents: 0,
      expenseCents: 0,
    };
  });

  for (const transaction of transactions) {
    if (transaction.amountCents < 0) {
      result.forEach((month, index) => {
        const expenseCents = getExpenseOccurrencesForMonth(transaction, month.month).reduce(
          (total, expense) => total + Math.abs(expense.amountCents),
          0,
        );
        result[index].expenseCents += expenseCents;
      });
      continue;
    }

    const dateValue = transaction.occurredAt;
    if (!dateValue) continue;
    const date = new Date(dateValue);
    const index =
      (date.getFullYear() - start.getFullYear()) * 12 + date.getMonth() - start.getMonth();
    if (index < 0 || index >= months) continue;
    if (transaction.amountCents >= 0) result[index].incomeCents += transaction.amountCents;
    else result[index].expenseCents += Math.abs(transaction.amountCents);
  }

  return result;
}

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

  return Array.from({ length: days.length / 7 }, (_, index) =>
    days.slice(index * 7, index * 7 + 7),
  );
}

export function buildDashboardInsights(
  transactions: Transaction[],
  referenceDate: Date = new Date(),
): DashboardInsights {
  const expenseTransactions = transactions.filter((transaction) => transaction.amountCents < 0);
  const scheduledExpenses = expenseTransactions
    .flatMap((expense) => getExpenseOccurrencesForMonth(expense, referenceDate))
    .sort((left, right) => left.dateKey.localeCompare(right.dateKey));
  const categoriesByTransactionId = new Map(
    expenseTransactions.map((transaction) => [transaction.id, transaction.category]),
  );
  const monthIncomeTransactions = transactions.filter(
    (transaction) =>
      transaction.amountCents >= 0 && isSameMonth(new Date(transaction.occurredAt), referenceDate),
  );
  const categoryTotals = new Map<string, number>();
  const weeklyTotals = Array.from({ length: 5 }, (_, index) => ({
    label: String(index * 7 + 1).padStart(2, "0"),
    incomeCents: 0,
    expenseCents: 0,
  }));

  let monthlyIncomeCents = 0;
  let monthlyExpenseCents = 0;

  for (const transaction of monthIncomeTransactions) {
    const amount = transaction.amountCents;
    const transactionDate = new Date(transaction.occurredAt);
    const weekIndex = Math.min(4, Math.floor((transactionDate.getDate() - 1) / 7));

    monthlyIncomeCents += amount;
    weeklyTotals[weekIndex].incomeCents += amount;
  }

  for (const expense of scheduledExpenses) {
    const occurrenceDate = new Date(`${expense.dateKey}T12:00:00`);
    const weekIndex = Math.min(4, Math.floor((occurrenceDate.getDate() - 1) / 7));
    const expenseCents = Math.abs(expense.amountCents);
    const category = categoriesByTransactionId.get(expense.transactionId) ?? "Outros";
    monthlyExpenseCents += expenseCents;
    weeklyTotals[weekIndex].expenseCents += expenseCents;
    categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + expenseCents);
  }

  const expenseByCategory = [...categoryTotals.entries()]
    .map(([category, amountCents]) => ({ category, amountCents }))
    .sort((left, right) => right.amountCents - left.amountCents);
  const healthStatus = getHealthStatus(monthlyIncomeCents, monthlyExpenseCents);
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
