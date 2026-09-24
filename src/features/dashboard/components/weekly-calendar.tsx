import { getMonthDeltaForSwipe } from "@/src/features/dashboard/model/calendar-swipe";
import { getCalendarWeeks, getWeekDays } from "@/src/features/dashboard/model/dashboard-insights";
import type { ExpenseOccurrence } from "@/src/features/dashboard/model/expense-occurrences";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";
import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BanknoteArrowDown, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMemo } from "react";
import { PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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
                        color={day.isSelected ? colors.text : colors.darkPink}
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
      {nextExpense || selectedExpenses.length > 0 ? (
        <View style={styles.nextExpenseSection}>
          {nextExpense ? <View style={styles.legend}></View> : null}
          {selectedExpenses.map((expense) => (
            <View
              key={`${expense.transactionId}-${expense.dateKey}`}
              style={styles.selectedExpense}
            >
              <View style={styles.selectedExpenseInfo}>
                <BanknoteArrowDown color={colors.darkPink} size={15} strokeWidth={2.4} />
                <Text style={styles.selectedExpenseTitle}>{expense.title}</Text>
              </View>
              <Text style={styles.selectedExpenseAmount}>
                - {formatCurrencyFromCents(Math.abs(expense.amountCents))}
              </Text>
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
  nextExpenseSection: { gap: 6, marginTop: 10 },
  nextExpense: { alignItems: "center", flexDirection: "row", gap: 6 },
  nextExpenseText: { color: colors.muted, flex: 1, fontSize: 12 },
  legend: { alignItems: "center", flexDirection: "row", gap: 4 },
  legendText: { color: colors.muted, fontSize: 11 },
  selectedExpense: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  selectedExpenseInfo: { alignItems: "center", flex: 1, flexDirection: "row", gap: 6 },
  selectedExpenseTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  selectedExpenseAmount: { color: colors.negative, fontFamily: fonts.bold, fontSize: 12 },
});
