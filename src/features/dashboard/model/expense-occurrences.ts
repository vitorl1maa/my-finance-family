import { addDays, differenceInCalendarDays, isBefore } from "date-fns";

import type { Transaction } from "@/src/features/transactions/model/transaction";

export type ExpenseOccurrence = {
  transactionId: string;
  title: string;
  amountCents: number;
  dateKey: string;
};

type Expense = Pick<Transaction, "amountCents" | "id" | "occurredAt" | "recurrenceRule" | "title">;

export function getExpenseOccurrencesForMonth(expense: Expense, month: Date): ExpenseOccurrence[] {
  if (expense.amountCents >= 0) return [];

  const baseDate = atNoon(new Date(expense.occurredAt));
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1, 12);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0, 12);
  const rule = expense.recurrenceRule ?? "none";
  const occurrences: Date[] = [];

  if (rule === "monthly") {
    if (!isBefore(monthEnd, baseDate)) {
      occurrences.push(getMonthlyOccurrence(baseDate, monthStart));
    }
  } else if (rule === "every-15-days") {
    let occurrence = baseDate;
    while (isBefore(occurrence, monthStart)) occurrence = addDays(occurrence, 15);
    while (!isBefore(monthEnd, occurrence)) {
      occurrences.push(occurrence);
      occurrence = addDays(occurrence, 15);
    }
  } else if (!isBefore(baseDate, monthStart) && !isBefore(monthEnd, baseDate)) {
    occurrences.push(baseDate);
  }

  return occurrences.map((date) => ({
    transactionId: expense.id,
    title: expense.title,
    amountCents: expense.amountCents,
    dateKey: toDateKey(date),
  }));
}

export function getNextExpenseOccurrence(
  expenses: Expense[],
  referenceDate: Date,
): ExpenseOccurrence | undefined {
  const reference = atNoon(referenceDate);
  const occurrences = expenses
    .filter((expense) => expense.amountCents < 0)
    .map((expense) => getFirstOccurrenceOnOrAfter(expense, reference))
    .filter((occurrence): occurrence is ExpenseOccurrence => occurrence !== undefined)
    .sort((left, right) => left.dateKey.localeCompare(right.dateKey));

  return occurrences[0];
}

function getFirstOccurrenceOnOrAfter(expense: Expense, reference: Date): ExpenseOccurrence | undefined {
  const baseDate = atNoon(new Date(expense.occurredAt));
  const rule = expense.recurrenceRule ?? "none";
  let occurrence: Date | undefined;

  if (rule === "monthly") {
    const firstMonth = isBefore(reference, baseDate) ? baseDate : reference;
    occurrence = getMonthlyOccurrence(baseDate, firstMonth);
    if (isBefore(occurrence, reference)) {
      occurrence = getMonthlyOccurrence(baseDate, new Date(reference.getFullYear(), reference.getMonth() + 1, 1));
    }
  } else if (rule === "every-15-days") {
    if (isBefore(reference, baseDate)) occurrence = baseDate;
    else {
      const elapsedDays = differenceInCalendarDays(reference, baseDate);
      occurrence = addDays(baseDate, Math.ceil(elapsedDays / 15) * 15);
    }
  } else if (!isBefore(baseDate, reference)) {
    occurrence = baseDate;
  }

  if (!occurrence) return undefined;

  return {
    transactionId: expense.id,
    title: expense.title,
    amountCents: expense.amountCents,
    dateKey: toDateKey(occurrence),
  };
}

function getMonthlyOccurrence(baseDate: Date, month: Date): Date {
  const day = Math.min(baseDate.getDate(), new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate());
  return new Date(month.getFullYear(), month.getMonth(), day, 12);
}

function atNoon(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
