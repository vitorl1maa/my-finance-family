import { addMonths, format, isSameDay, isSameMonth, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { getExpenseCalendarDays } from "@/src/features/transactions/model/expense-date";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export type RecurrenceRule = "none" | "monthly" | "every-15-days";

export const recurrenceOptions: { label: string; value: RecurrenceRule }[] = [
  { label: "Não se repete", value: "none" },
  { label: "1 vez por mês", value: "monthly" },
  { label: "A cada 15 dias", value: "every-15-days" },
];

export function recurrenceLabel(rule: RecurrenceRule): string {
  return recurrenceOptions.find((option) => option.value === rule)?.label ?? "Não se repete";
}

type ExpenseRecurrencePickerProps = {
  date: Date;
  rule: RecurrenceRule;
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date, rule: RecurrenceRule) => void;
};

export function ExpenseRecurrencePicker({
  date,
  rule,
  visible,
  onClose,
  onConfirm,
}: ExpenseRecurrencePickerProps) {
  const [month, setMonth] = useState(startOfMonth(date));
  const [draftDate, setDraftDate] = useState(date);
  const [draftRule, setDraftRule] = useState(rule);
  const days = getExpenseCalendarDays(month);

  useEffect(() => {
    if (visible) {
      setMonth(startOfMonth(date));
      setDraftDate(date);
      setDraftRule(rule);
    }
  }, [date, rule, visible]);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          accessibilityLabel="Fechar recorrência"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Recorrência</Text>
              <Text style={styles.subtitle}>Escolha a data e o período da despesa</Text>
            </View>
            <Pressable
              accessibilityLabel="Fechar recorrência"
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
              const selected = isSameDay(day, draftDate);

              return (
                <Pressable
                  key={day.toISOString()}
                  onPress={() => setDraftDate(day)}
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
          <Text style={styles.periodLabel}>Período</Text>
          <View style={styles.options}>
            {recurrenceOptions.map((option) => {
              const selected = option.value === draftRule;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => setDraftRule(option.value)}
                  style={[styles.option, selected && styles.selectedOption]}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                  {selected ? <Check color={colors.text} size={18} /> : null}
                </Pressable>
              );
            })}
          </View>
          <Pressable onPress={() => onConfirm(draftDate, draftRule)} style={styles.confirm}>
            <Text style={styles.confirmText}>Concluir</Text>
          </Pressable>
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
    paddingBottom: 32,
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
    marginTop: 18,
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
  weekdays: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  weekday: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 12,
    textAlign: "center",
    width: "14.2857%",
  },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  day: {
    alignItems: "center",
    borderRadius: 22,
    height: 34,
    justifyContent: "center",
    marginVertical: 2,
    width: "14.2857%",
  },
  outsideDay: { opacity: 0.3 },
  selectedDay: { backgroundColor: colors.accent },
  dayText: { color: colors.text, fontFamily: fonts.semiBold, fontSize: 13 },
  selectedDayText: { fontFamily: fonts.extraBold },
  periodLabel: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 13, marginTop: 12 },
  options: { gap: 6, marginTop: 8 },
  option: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 42,
    paddingHorizontal: 14,
  },
  selectedOption: { backgroundColor: colors.accent, borderColor: colors.accent },
  optionText: { color: colors.text, fontFamily: fonts.semiBold, fontSize: 13 },
  confirm: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 14,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 48,
  },
  confirmText: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 14 },
});
