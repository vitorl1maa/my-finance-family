import { CalendarDays, Repeat2, Tags, WalletCards, X } from "lucide-react-native";
import type { ComponentType } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { getTransactionDetail } from "@/src/features/transactions/model/transaction-detail";
import type { Transaction } from "@/src/features/transactions/model/transaction";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

export function TransactionDetailModal({
  transaction,
  onClose,
}: {
  transaction?: Transaction;
  onClose: () => void;
}) {
  const detail = transaction ? getTransactionDetail(transaction) : null;
  const expense = detail?.kind === "expense";
  const fields: Array<[string, string, ComponentType<{ color: string; size: number }>]> =
    transaction && detail
      ? expense
        ? [
            ["Categoria", transaction.category, Tags],
            [
              "Vencimento",
              new Date(transaction.occurredAt).toLocaleDateString("pt-BR"),
              CalendarDays,
            ],
            [
              "Recorrência",
              transaction.recurrenceRule === "monthly"
                ? "Mensal"
                : transaction.recurrenceRule === "every-15-days"
                  ? "A cada 15 dias"
                  : "Não se repete",
              Repeat2,
            ],
          ]
        : [
            ["Valor mensal", formatCurrencyFromCents(transaction.amountCents), WalletCards],
            ["Tipo de fonte", transaction.category, WalletCards],
          ]
      : [];
  return (
    <Modal animationType="fade" transparent visible={!!transaction} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Pressable accessibilityLabel="Fechar detalhes" onPress={onClose} style={styles.close}>
            <X color={colors.text} size={19} />
          </Pressable>
          <View style={[styles.icon, { backgroundColor: expense ? "#FFF0F4" : "#EFFAE5" }]}>
            <WalletCards color={expense ? colors.darkPink : colors.positive} size={26} />
          </View>
          <Text style={styles.title}>{detail?.title}</Text>
          <Text style={[styles.amount, { color: expense ? colors.darkPink : colors.positive }]}>
            {expense ? "− " : ""}
            {transaction ? formatCurrencyFromCents(Math.abs(transaction.amountCents)) : ""}
          </Text>
          <View style={styles.fields}>
            {fields.map(([label, value, Icon]) => (
              <View key={String(label)} style={styles.row}>
                <View style={styles.label}>
                  <Icon color={colors.muted} size={16} />
                  <Text style={styles.labelText}>{label}</Text>
                </View>
                <Text style={styles.value}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "#00000066",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 26,
    gap: 16,
    maxWidth: 390,
    padding: 24,
    width: "100%",
  },
  close: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    position: "absolute",
    right: 16,
    top: 16,
    width: 36,
  },
  icon: { alignItems: "center", borderRadius: 30, height: 60, justifyContent: "center", width: 60 },
  title: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 23 },
  amount: { fontFamily: fonts.extraBold, fontSize: 30 },
  fields: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    gap: 4,
    padding: 8,
    width: "100%",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 52,
  },
  label: { alignItems: "center", flexDirection: "row", gap: 8 },
  labelText: { color: colors.muted, fontSize: 12 },
  value: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
});
