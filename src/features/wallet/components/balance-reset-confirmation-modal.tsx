import { AlertTriangle, X } from "lucide-react-native";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export function BalanceResetConfirmationModal({
  target,
  onCancel,
  onConfirm,
}: {
  target: "wallet" | "piggy_bank" | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const name = target === "wallet" ? "carteira" : "cofrinho";

  return (
    <Modal animationType="fade" transparent visible={target !== null} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Pressable
            accessibilityLabel="Fechar confirmação"
            onPress={onCancel}
            style={styles.close}
          >
            <X color={colors.text} size={19} />
          </Pressable>
          <View style={styles.icon}>
            <AlertTriangle color={colors.negative} size={26} />
          </View>
          <Text style={styles.title}>Zerar saldo?</Text>
          <Text style={styles.description}>
            O saldo da {name} será zerado. Suas despesas e fontes de renda não serão excluídas.
          </Text>
          <Pressable accessibilityRole="button" onPress={onConfirm} style={styles.confirm}>
            <Text style={styles.confirmText}>Zerar saldo</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onCancel} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
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
    gap: 14,
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
  icon: {
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  title: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 22 },
  description: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: "center" },
  confirm: {
    alignItems: "center",
    backgroundColor: colors.negative,
    borderRadius: 15,
    justifyContent: "center",
    marginTop: 4,
    minHeight: 52,
    width: "100%",
  },
  confirmText: { color: colors.background, fontFamily: fonts.extraBold, fontSize: 14 },
  cancel: { alignItems: "center", minHeight: 34, justifyContent: "center", width: "100%" },
  cancelText: { color: colors.muted, fontFamily: fonts.bold, fontSize: 13 },
});
