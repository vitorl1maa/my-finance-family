import { addMonths, format, isSameDay, isSameMonth, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, ArrowRight, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { getExpenseCalendarDays } from "@/src/features/transactions/model/expense-date";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

type ExpenseDatePickerProps = {
  value: Date;
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
};

export function ExpenseDatePicker({ value, visible, onClose, onSelect }: ExpenseDatePickerProps) {
  const [month, setMonth] = useState(startOfMonth(value));
  const days = getExpenseCalendarDays(month);

  useEffect(() => {
    if (visible) setMonth(startOfMonth(value));
  }, [value, visible]);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          accessibilityLabel="Fechar seletor de data"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Data da despesa</Text>
              <Text style={styles.subtitle}>Selecione quando o gasto aconteceu</Text>
            </View>
            <Pressable
              accessibilityLabel="Fechar calendário"
              onPress={onClose}
              style={styles.close}
            >
              <X color={colors.text} size={20} />
            </Pressable>
          </View>
          <View style={styles.monthHeader}>
            <Pressable
              accessibilityLabel="Mês anterior"
              onPress={() => setMonth(subMonths(month, 1))}
              style={styles.monthButton}
            >
              <ArrowLeft color={colors.text} size={18} />
            </Pressable>
            <Text style={styles.monthTitle}>{format(month, "MMMM yyyy", { locale: ptBR })}</Text>
            <Pressable
              accessibilityLabel="Próximo mês"
              onPress={() => setMonth(addMonths(month, 1))}
              style={styles.monthButton}
            >
              <ArrowRight color={colors.text} size={18} />
            </Pressable>
          </View>
          <View style={styles.weekdays}>
            {[
              { id: "sun", label: "D" },
              { id: "mon", label: "S" },
              { id: "tue", label: "T" },
              { id: "wed", label: "Q" },
              { id: "thu", label: "Q" },
              { id: "fri", label: "S" },
              { id: "sat", label: "S" },
            ].map((weekday) => (
              <Text key={weekday.id} style={styles.weekday}>
                {weekday.label}
              </Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {days.map((day) => {
              const selected = isSameDay(day, value);

              return (
                <Pressable
                  key={day.toISOString()}
                  onPress={() => onSelect(day)}
                  style={[
                    styles.day,
                    !isSameMonth(day, month) && styles.outsideDay,
                    selected && styles.selectedDay,
                  ]}
                >
                  <Text style={[styles.dayText, selected && styles.selectedDayText]}>
                    {format(day, "d")}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(0, 0, 0, 0.32)", flex: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
  },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  title: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 20 },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  close: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  monthHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },
  monthButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  monthTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 16,
    textTransform: "capitalize",
  },
  weekdays: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  weekday: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 12,
    textAlign: "center",
    width: "14.2857%",
  },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  day: {
    alignItems: "center",
    borderRadius: 22,
    height: 42,
    justifyContent: "center",
    marginVertical: 3,
    width: "14.2857%",
  },
  outsideDay: { opacity: 0.3 },
  selectedDay: { backgroundColor: colors.accent },
  dayText: { color: colors.text, fontFamily: fonts.semiBold, fontSize: 14 },
  selectedDayText: { fontFamily: fonts.extraBold },
});
