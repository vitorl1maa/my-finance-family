import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Send } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { getWeekDays } from "@/src/features/dashboard/model/dashboard-insights";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

type WeeklyCalendarProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  nextExpense?: { title: string; amountCents: number };
};

export function WeeklyCalendar({ selectedDate, onSelectDate, nextExpense }: WeeklyCalendarProps) {
  const days = getWeekDays(selectedDate);
  const monthLabel = format(selectedDate, "MMMM yyyy", { locale: ptBR });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.month}>{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</Text>
        <View style={styles.navigation}>
          <Pressable
            accessibilityLabel="Semana anterior"
            accessibilityRole="button"
            onPress={() => onSelectDate(addDays(selectedDate, -7))}
            style={styles.arrow}
          >
            <ChevronLeft color={colors.muted} size={16} />
          </Pressable>
          <Pressable
            accessibilityLabel="Próxima semana"
            accessibilityRole="button"
            onPress={() => onSelectDate(addDays(selectedDate, 7))}
            style={styles.arrow}
          >
            <ChevronRight color={colors.muted} size={16} />
          </Pressable>
        </View>
      </View>
      <View style={styles.days}>
        {days.map((day) => (
          <Pressable
            accessibilityLabel={`${day.shortWeekday} ${day.date}`}
            accessibilityRole="button"
            key={day.isoDate}
            onPress={() => onSelectDate(new Date(`${day.isoDate}T12:00:00`))}
            style={[styles.day, day.isSelected && styles.selectedDay]}
          >
            <Text style={[styles.weekday, day.isSelected && styles.selectedText]}>
              {day.shortWeekday}
            </Text>
            <Text style={[styles.date, day.isSelected && styles.selectedText]}>{day.date}</Text>
          </Pressable>
        ))}
      </View>
      {nextExpense ? (
        <View style={styles.nextExpense}>
          <Send color={colors.darkPink} size={14} />
          <Text numberOfLines={1} style={styles.nextExpenseText}>
            Próxima despesa: {nextExpense.title}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  month: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 13 },
  navigation: { flexDirection: "row", gap: 6 },
  arrow: { alignItems: "center", height: 26, justifyContent: "center", width: 26 },
  days: { flexDirection: "row", gap: 4, marginTop: 7 },
  day: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    gap: 2,
    justifyContent: "center",
    minHeight: 36,
  },
  selectedDay: { backgroundColor: colors.accent },
  weekday: { color: colors.muted, fontFamily: fonts.bold, fontSize: 12 },
  date: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 12, padding: 12 },
  selectedText: { color: colors.text, fontWeight: "900" },
  nextExpense: { alignItems: "center", flexDirection: "row", gap: 6, marginTop: 10 },
  nextExpenseText: { color: colors.muted, flex: 1, fontSize: 12 },
});
