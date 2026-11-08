import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BanknoteArrowDown, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMemo } from "react";
import { PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getMonthDeltaForSwipe } from "@/src/features/dashboard/model/calendar-swipe";
import {
  getCalendarWeeks,
  getSelectedDayExpenseSummary,
  getWeekDays,
} from "@/src/features/dashboard/model/dashboard-insights";
import type { ExpenseOccurrence } from "@/src/features/dashboard/model/expense-occurrences";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

type WeeklyCalendarProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  nextExpense?: ExpenseOccurrence;
  scheduledExpenses: ExpenseOccurrence[];
  expanded?: boolean;
};

export function WeeklyCalendar({
  selectedDate,
  onSelectDate,
  nextExpense,
  scheduledExpenses,
  expanded = false,
}: WeeklyCalendarProps) {
  const weeks = expanded ? getCalendarWeeks(selectedDate) : [getWeekDays(selectedDate)];
  const monthLabel = format(selectedDate, "MMMM yyyy", { locale: ptBR });
  const nextExpenseDate = nextExpense?.dateKey;
  const selectedExpenses = scheduledExpenses.filter(
    (expense) => expense.dateKey === format(selectedDate, "yyyy-MM-dd"),
  );
  const selectedExpenseSummary = getSelectedDayExpenseSummary(selectedExpenses);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          getMonthDeltaForSwipe(gesture.dx, gesture.dy) !== 0,
        onPanResponderRelease: (_, gesture) => {
          const monthDelta = getMonthDeltaForSwipe(gesture.dx, gesture.dy);
          if (monthDelta !== 0) onSelectDate(addMonths(selectedDate, monthDelta));
        },
      }),
    [onSelectDate, selectedDate],
  );

  return (
    <ScrollView
      {...panResponder.panHandlers}
      contentContainerStyle={styles.container}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
    >
      <View style={styles.header}>
        <Text style={styles.month}>{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</Text>
        <View style={styles.navigation}>
          <Pressable
            accessibilityLabel="Mês anterior"
            accessibilityRole="button"
            onPress={() => onSelectDate(addMonths(selectedDate, -1))}
            style={styles.arrow}
          >
            <ChevronLeft color={colors.muted} size={16} />
          </Pressable>
          <Pressable
            accessibilityLabel="Próximo mês"
            accessibilityRole="button"
            onPress={() => onSelectDate(addMonths(selectedDate, 1))}
            style={styles.arrow}
          >
            <ChevronRight color={colors.muted} size={16} />
          </Pressable>
        </View>
      </View>
      <View style={styles.weekdayHeader}>
        {weeks[0].map((day) => (
          <Text key={day.isoDate} style={styles.weekday}>
            {day.shortWeekday}
          </Text>
        ))}
      </View>
      <View style={styles.weeks}>
        {weeks.map((week) => (
          <View key={week[0].isoDate} style={styles.days}>
            {week.map((day) => {
              const isNextExpenseDay = nextExpenseDate === day.isoDate;
              const isScheduledExpenseDay = scheduledExpenses.some(
                (expense) => expense.dateKey === day.isoDate,
              );
              const isPaidExpenseDay = scheduledExpenses.some(
                (expense) => expense.dateKey === day.isoDate && expense.paymentStatus === "paid",
              );

              return (
                <Pressable
                  accessibilityLabel={`${day.shortWeekday} ${day.date}${isNextExpenseDay ? ", próxima despesa" : isScheduledExpenseDay ? ", despesa programada" : ""}`}
                  accessibilityRole="button"
                  key={day.isoDate}
                  onPress={() => onSelectDate(new Date(`${day.isoDate}T12:00:00`))}
                  style={[
                    styles.day,
                    isScheduledExpenseDay && styles.scheduledExpenseDay,
                    isNextExpenseDay && styles.nextExpenseDay,
                    day.isSelected && styles.selectedDay,
                    isPaidExpenseDay && styles.paidExpenseDay,
                  ]}
                >
                  <View style={styles.dateContent}>
                    <Text
                      style={[
                        styles.date,
                        !day.isCurrentMonth && styles.outsideMonthDate,
                        day.isSelected && styles.selectedText,
                      ]}
                    >
                      {day.date}
                    </Text>
                    {isScheduledExpenseDay ? (
                      <BanknoteArrowDown
                        color={
                          isPaidExpenseDay
                            ? colors.positive
                            : day.isSelected
                              ? colors.text
                              : colors.darkPink
                        }
                        size={12}
                        strokeWidth={2.4}
                      />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      {selectedExpenses.length > 0 ? (
        <View style={styles.selectedExpensesCard}>
          <View style={styles.selectedExpensesHeader}>
            <Text style={styles.selectedExpensesHeading}>
              Lançamentos do dia {selectedDate.getDate()}
            </Text>
            <Text style={styles.selectedExpensesTotal}>
              Total:{" "}
              <Text style={styles.selectedExpensesTotalAmount}>
                {formatCurrencyFromCents(selectedExpenseSummary.totalCents)}
              </Text>
            </Text>
          </View>
          {selectedExpenses.map((expense) => (
            <View
              key={`${expense.transactionId}-${expense.dateKey}`}
              style={styles.selectedExpense}
            >
              <View
                style={[
                  styles.selectedExpenseIcon,
                  expense.paymentStatus === "paid"
                    ? styles.selectedExpenseIconPaid
                    : styles.selectedExpenseIconPending,
                ]}
              >
                <BanknoteArrowDown
                  color={expense.paymentStatus === "paid" ? colors.positive : colors.darkPink}
                  size={14}
                  strokeWidth={2.4}
                />
              </View>
              <View style={styles.selectedExpenseInfo}>
                <Text style={styles.selectedExpenseTitle}>{expense.title}</Text>
                <Text style={styles.selectedExpenseSubtitle}>Despesa programada</Text>
              </View>
              <View style={styles.selectedExpenseMeta}>
                <Text
                  style={[
                    styles.selectedExpenseStatus,
                    expense.paymentStatus === "paid"
                      ? styles.selectedExpenseStatusPaid
                      : styles.selectedExpenseStatusPending,
                  ]}
                >
                  {expense.paymentStatus === "paid" ? "Pago" : "Pendente"}
                </Text>
                <Text
                  style={[
                    styles.selectedExpenseAmount,
                    expense.paymentStatus === "paid" && styles.paidExpenseText,
                  ]}
                >
                  -{formatCurrencyFromCents(Math.abs(expense.amountCents))}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  month: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 13 },
  navigation: { flexDirection: "row", gap: 6 },
  arrow: { alignItems: "center", height: 26, justifyContent: "center", width: 26 },
  weekdayHeader: { flexDirection: "row", marginTop: 10 },
  weeks: { gap: 5, marginTop: 4 },
  days: { flexDirection: "row", gap: 4 },
  day: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    gap: 2,
    justifyContent: "center",
    minHeight: 34,
  },
  selectedDay: { backgroundColor: colors.accent },
  scheduledExpenseDay: { backgroundColor: "#FFF1F5" },
  nextExpenseDay: { backgroundColor: "#FCE7F3" },
  paidExpenseDay: { backgroundColor: "#DCFCE7" },
  weekday: {
    color: colors.muted,
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 11,
    textAlign: "center",
  },
  date: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 12 },
  dateContent: { alignItems: "center", flexDirection: "row", gap: 2 },
  outsideMonthDate: { color: colors.mutedLight },
  selectedText: { color: colors.text, fontWeight: "900" },
  selectedExpensesCard: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 2,
    marginTop: 12,
    overflow: "hidden",
  },
  selectedExpensesHeader: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectedExpensesHeading: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 13 },
  selectedExpensesTotal: { color: colors.muted, fontFamily: fonts.bold, fontSize: 11 },
  selectedExpensesTotalAmount: { color: colors.negative, fontFamily: fonts.extraBold },
  selectedExpense: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  selectedExpenseIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  selectedExpenseIconPaid: { backgroundColor: "#E8F9EA" },
  selectedExpenseIconPending: { backgroundColor: "#FFF0F4" },
  selectedExpenseInfo: { flex: 1, gap: 1 },
  selectedExpenseTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  selectedExpenseSubtitle: { color: colors.muted, fontFamily: fonts.regular, fontSize: 10 },
  selectedExpenseMeta: { alignItems: "flex-end", gap: 4 },
  selectedExpenseStatus: {
    borderRadius: 99,
    fontFamily: fonts.bold,
    fontSize: 10,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  selectedExpenseStatusPaid: { backgroundColor: "#E8F9EA", color: colors.positive },
  selectedExpenseStatusPending: { backgroundColor: "#FFF0D8", color: "#9A6300" },
  selectedExpenseAmount: { color: colors.negative, fontFamily: fonts.extraBold, fontSize: 12 },
  paidExpenseText: { color: colors.positive },
});
