import { ArrowRight, CircleDollarSign, X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { IncomeSource } from "@/src/features/income-sources/model/income-source";
import { SmoothTextInput } from "@/src/shared/components/smooth-text-input";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";
import { formatBrlInput, parseBrlInputToCents } from "@/src/shared/utils/money";

export function IncomeSourceNewView({
  onBack,
  onSave,
}: {
  onBack: () => void;
  onSave: (name: string, amountCents: number, kind: IncomeSource["kind"]) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState<IncomeSource["kind"]>("other");
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const amountCents = parseBrlInputToCents(amount);
    if (!name.trim()) {
      setError("Informe o nome da fonte de renda.");
      return;
    }
    if (amountCents <= 0) {
      setError("Informe um valor mensal maior que zero.");
      return;
    }

    try {
      await onSave(name, amountCents, kind);
      onBack();
    } catch {
      setError("Não foi possível salvar a fonte. Tente novamente.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Nova fonte de renda</Text>
          <Text style={styles.headerSubtitle}>Registre uma entrada recorrente</Text>
        </View>
        <Pressable accessibilityLabel="Fechar nova fonte" onPress={onBack} style={styles.close}>
          <X color={colors.text} size={20} />
        </Pressable>
      </View>
      <Text style={styles.title}>De onde vem sua renda?</Text>
      <Text style={styles.description}>Adicione uma fonte para acompanhar seu saldo mensal.</Text>
      <Field label="Nome da fonte" placeholder="Ex.: Salário" value={name} onChangeText={setName} />
      <Field
        label="Valor mensal"
        placeholder="R$ 0,00"
        value={amount}
        onChangeText={(value) => setAmount(formatBrlInput(value))}
        keyboardType="decimal-pad"
      />
      <Text style={styles.label}>Tipo de fonte</Text>
      <View style={styles.kindRow}>
        {(["salary", "investment", "other"] as const).map((option) => (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: kind === option }}
            key={option}
            onPress={() => setKind(option)}
            style={[styles.kindOption, kind === option && styles.kindOptionSelected]}
          >
            <Text style={[styles.kindText, kind === option && styles.kindTextSelected]}>
              {option === "salary" ? "Salário" : option === "investment" ? "Investimento" : "Outra"}
            </Text>
          </Pressable>
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable accessibilityRole="button" onPress={() => void save()} style={styles.primary}>
        <Text style={styles.primaryText}>Adicionar fonte</Text>
        <ArrowRight color={colors.text} size={19} strokeWidth={2.5} />
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "decimal-pad";
}) {
  return (
    <View style={styles.field}>
      <CircleDollarSign color={colors.muted} size={18} />
      <View style={styles.fieldContent}>
        <Text style={styles.label}>{label}</Text>
        <SmoothTextInput
          accessibilityLabel={label}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedLight}
          style={styles.input}
          value={value}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: 14,
    padding: 20,
    paddingBottom: 32,
  },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  headerTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 20 },
  headerSubtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  close: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  title: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 28, marginTop: 4 },
  description: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: 8 },
  field: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 14,
  },
  fieldContent: { flex: 1, gap: 2 },
  label: { color: colors.mutedLight, fontSize: 11, fontWeight: "800" },
  input: { color: colors.text, fontFamily: fonts.bold, fontSize: 15, padding: 0 },
  kindRow: { flexDirection: "row", gap: 8 },
  kindOption: {
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  kindOptionSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  kindText: { color: colors.muted, fontFamily: fonts.bold, fontSize: 12, textAlign: "center" },
  kindTextSelected: { color: colors.text },
  error: { color: colors.negative, fontSize: 12 },
  primary: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 16,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 58,
  },
  primaryText: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 15 },
});
