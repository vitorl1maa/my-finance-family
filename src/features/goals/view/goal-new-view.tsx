import { ArrowRight, CalendarDays, Target, WalletCards, X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useGoalsStore } from "@/src/features/goals/store/goals-store";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";
import { formatBrlInput, parseBrlInputToCents } from "@/src/shared/utils/money";

export function GoalNewView({ onBack }: { onBack: () => void }) {
  const addGoal = useGoalsStore((state) => state.addGoal);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const targetCents = parseBrlInputToCents(target);
    if (!title.trim() || targetCents <= 0) {
      setError("Informe um nome e um valor-alvo válido.");
      return;
    }

    addGoal({
      id: `goal-${Date.now()}`,
      title: title.trim(),
      category: "Planejamento",
      priority: "Média",
      targetCents,
      savedCents: 0,
      dueDate: dueDate.trim() || null,
      syncStatus: "pending",
    });
    onBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.topRow}>
        <Pressable accessibilityLabel="Fechar nova meta" onPress={onBack} style={styles.back}>
          <X color={colors.text} size={20} />
        </Pressable>
        <Text style={styles.step}>Nova meta</Text>
        <Target color={colors.text} size={22} />
      </View>
      <View style={styles.heroIcon}>
        <WalletCards color={colors.text} size={25} />
      </View>
      <Text style={styles.title}>Dê um nome para sua meta</Text>
      <Text style={styles.description}>
        Defina um objetivo e acompanhe seu progresso até alcançar.
      </Text>
      <Field
        icon={<Target color={colors.muted} size={18} />}
        label="Nome da meta"
        placeholder="Ex.: Viagem de férias"
        value={title}
        onChangeText={setTitle}
      />
      <Field
        icon={<WalletCards color={colors.muted} size={18} />}
        label="Valor-alvo"
        placeholder="R$ 0,00"
        value={target}
        onChangeText={(value) => setTarget(formatBrlInput(value))}
        keyboardType="decimal-pad"
      />
      <Field
        icon={<CalendarDays color={colors.muted} size={18} />}
        label="Prazo (opcional)"
        placeholder="AAAA-MM-DD"
        value={dueDate}
        onChangeText={setDueDate}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable accessibilityRole="button" onPress={save} style={styles.primary}>
        <Text style={styles.primaryText}>Criar meta</Text>
        <ArrowRight color={colors.text} size={19} strokeWidth={2.5} />
      </Pressable>
    </ScrollView>
  );
}

function Field({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "decimal-pad";
}) {
  return (
    <View style={styles.field}>
      {icon}
      <View style={styles.fieldContent}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          autoCapitalize="sentences"
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
    paddingBottom: 40,
  },
  topRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  back: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  step: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
  heroIcon: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 17,
    height: 54,
    justifyContent: "center",
    marginTop: 18,
    width: 54,
  },
  title: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 30, marginTop: 4 },
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
