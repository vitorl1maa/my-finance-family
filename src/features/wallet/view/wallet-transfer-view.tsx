import { ArrowRight, ArrowDownToLine, ArrowUpFromLine, X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { SmoothTextInput } from "@/src/shared/components/smooth-text-input";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";
import { formatBrlInput, parseBrlInputToCents } from "@/src/shared/utils/money";

export function WalletTransferView({
  direction,
  onBack,
  onTransfer,
}: {
  direction: "to_piggy_bank" | "from_piggy_bank";
  onBack: () => void;
  onTransfer: (amountCents: number) => Promise<void>;
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isSaving = direction === "to_piggy_bank";

  const submit = async () => {
    const amountCents = parseBrlInputToCents(amount);
    if (amountCents <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }
    try {
      await onTransfer(amountCents);
      onBack();
    } catch {
      setError("Saldo insuficiente para realizar essa operação.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{isSaving ? "Guardar no cofrinho" : "Resgatar do cofrinho"}</Text>
          <Text style={styles.headerSubtitle}>{isSaving ? "Separe uma parte do seu saldo" : "Traga o valor de volta para a carteira"}</Text>
        </View>
        <Pressable accessibilityLabel="Fechar transferência" onPress={onBack} style={styles.close}>
          <X color={colors.text} size={20} />
        </Pressable>
      </View>
      <View style={styles.iconCircle}>
        {isSaving ? <ArrowDownToLine color={colors.walletDark} size={28} /> : <ArrowUpFromLine color={colors.walletDark} size={28} />}
      </View>
      <Text style={styles.title}>Quanto você quer {isSaving ? "guardar" : "resgatar"}?</Text>
      <Text style={styles.description}>A transferência acontece entre sua carteira e o cofrinho.</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Valor</Text>
        <SmoothTextInput
          accessibilityLabel="Valor da transferência"
          autoFocus
          keyboardType="decimal-pad"
          onChangeText={(value) => setAmount(formatBrlInput(value))}
          placeholder="R$ 0,00"
          placeholderTextColor={colors.mutedLight}
          style={styles.input}
          value={amount}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable accessibilityRole="button" onPress={() => void submit()} style={styles.primary}>
        <Text style={styles.primaryText}>{isSaving ? "Guardar valor" : "Resgatar valor"}</Text>
        <ArrowRight color={colors.text} size={19} strokeWidth={2.5} />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { backgroundColor: colors.background, flexGrow: 1, gap: 14, padding: 20, paddingBottom: 32, paddingTop: 20 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  headerTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 20 },
  headerSubtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  close: { alignItems: "center", backgroundColor: colors.surfaceMuted, borderRadius: 21, height: 42, justifyContent: "center", width: 42 },
  iconCircle: { alignItems: "center", backgroundColor: colors.accent, borderRadius: 28, height: 56, justifyContent: "center", marginTop: 16, width: 56 },
  title: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 27, marginTop: 4 },
  description: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: 8 },
  field: { borderColor: colors.border, borderRadius: 16, borderWidth: 1, gap: 2, minHeight: 70, paddingHorizontal: 14, paddingVertical: 11 },
  label: { color: colors.mutedLight, fontSize: 11, fontWeight: "800" },
  input: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 24, padding: 0 },
  error: { color: colors.negative, fontSize: 12 },
  primary: { alignItems: "center", backgroundColor: colors.accent, borderRadius: 16, flexDirection: "row", gap: 10, justifyContent: "center", marginTop: 14, minHeight: 58 },
  primaryText: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 15 },
});
