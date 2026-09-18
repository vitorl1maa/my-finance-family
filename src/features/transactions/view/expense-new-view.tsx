import { ArrowLeft, ArrowRight, Ellipsis, FileText, Repeat2, Tags } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { fallbackExpenseCategories } from "@/src/features/categories/model/expense-category";
import { CategoryPicker } from "@/src/features/transactions/components/category-picker";
import {
  ExpenseRecurrencePicker,
  type RecurrenceRule,
  recurrenceLabel,
} from "@/src/features/transactions/components/expense-recurrence-picker";
import { toExpenseIso } from "@/src/features/transactions/model/expense-date";
import { useTransactionsViewModel } from "@/src/features/transactions/view-model/use-transactions-view-model";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";
import { formatBrlInput, parseBrlInputToCents } from "@/src/shared/utils/money";

type ExpenseForm = {
  title: string;
  amount: string;
  categoryId: string;
  recurrence: string;
};
type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  icon: React.ReactNode;
  error?: string;
  multiline?: boolean;
  onPress?: () => void;
  selector?: boolean;
};

export function ExpenseNewView({ onBack }: { onBack: () => void }) {
  const {
    categories,
    categoriesError,
    categoriesLoading,
    createExpense,
    isSaving,
    reloadCategories,
    saveError,
  } = useTransactionsViewModel();
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [recurrencePickerVisible, setRecurrencePickerVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(fallbackExpenseCategories[0].id);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRecurrence, setSelectedRecurrence] = useState<RecurrenceRule>("none");
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm<ExpenseForm>({
    defaultValues: {
      title: "",
      amount: "",
      categoryId: fallbackExpenseCategories[0].id,
      recurrence: recurrenceLabel("none"),
    },
  });
  useEffect(() => {
    if (
      categories.length > 0 &&
      !categories.some((category) => category.id === selectedCategoryId)
    ) {
      setSelectedCategoryId(categories[0].id);
      setValue("categoryId", categories[0].id);
    }
  }, [categories, selectedCategoryId, setValue]);
  const onSubmit = async ({ title, categoryId, amount }: ExpenseForm) => {
    const category = categories.find((item) => item.id === categoryId);

    if (!category) return;

    try {
      await createExpense({
        title,
        categoryId,
        categoryName: category.name,
        amount,
        occurredAt: toExpenseIso(selectedDate),
        recurrenceRule: selectedRecurrence,
      });
      onBack();
    } catch {
      // The view-model exposes the error while preserving the form values.
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topRow}>
        <Pressable accessibilityLabel="Voltar" onPress={onBack} style={styles.back}>
          <ArrowLeft color={colors.text} size={22} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Nova despesa</Text>
          <Text style={styles.headerStep}>1 de 1</Text>
        </View>
        <Ellipsis color={colors.text} size={22} />
      </View>
      <Controller
        control={control}
        name="amount"
        rules={{
          validate: (value) => parseBrlInputToCents(value) > 0 || "Informe um valor válido.",
        }}
        render={({ field: { onChange, value } }) => (
          <View style={[styles.amountCard, errors.amount && styles.amountError]}>
            <Text style={styles.amountLabel}>VALOR DA DESPESA</Text>
            <TextInput
              keyboardType="decimal-pad"
              placeholder="R$ 0,00"
              placeholderTextColor={colors.text}
              style={styles.amountInput}
              value={value}
              onChangeText={(rawValue) => onChange(formatBrlInput(rawValue))}
            />
            <Text style={styles.amountHint}>Quanto você gastou?</Text>
            {errors.amount ? <Text style={styles.error}>{errors.amount.message}</Text> : null}
          </View>
        )}
      />
      <Controller
        control={control}
        name="title"
        rules={{ required: "Informe uma descrição." }}
        render={({ field: { onChange, value } }) => (
          <Field
            icon={<FileText color={colors.muted} size={18} />}
            label="Descrição"
            multiline
            placeholder="Ex.: Mercado, farmácia..."
            value={value}
            onChangeText={onChange}
            error={errors.title?.message}
          />
        )}
      />
      <Text style={styles.detailsLabel}>Detalhes da despesa</Text>
      <View style={styles.row}>
        <Controller
          control={control}
          name="categoryId"
          render={({ field: { onChange, value } }) => (
            <Field
              compact
              icon={<Tags color={colors.muted} size={17} />}
              label="Categoria"
              placeholder="Selecione"
              value={categories.find((category) => category.id === value)?.name ?? "Selecione"}
              onChangeText={onChange}
              onPress={() => setCategoryPickerVisible(true)}
              selector
            />
          )}
        />
      </View>
      <View style={styles.row}>
        <Controller
          control={control}
          name="recurrence"
          render={({ field: { value } }) => (
            <Field
              compact
              icon={<Repeat2 color={colors.muted} size={17} />}
              label="Recorrência"
              placeholder="Selecione"
              value={value}
              onChangeText={() => undefined}
              onPress={() => setRecurrencePickerVisible(true)}
              selector
            />
          )}
        />
      </View>
      {saveError ? <Text style={styles.formError}>{saveError}</Text> : null}
      <Pressable
        disabled={isSaving || categoriesLoading}
        onPress={handleSubmit(onSubmit)}
        style={[styles.primary, (isSaving || categoriesLoading) && styles.disabled]}
      >
        <Text style={styles.primaryText}>Salvar despesa</Text>
        <ArrowRight color={colors.text} size={19} strokeWidth={2.5} />
      </Pressable>
      <Pressable onPress={onBack} style={styles.cancel}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </Pressable>
      <CategoryPicker
        categories={categories}
        errorMessage={categoriesError ?? undefined}
        loading={categoriesLoading}
        onClose={() => setCategoryPickerVisible(false)}
        onRetry={reloadCategories}
        onSelect={(category) => {
          setSelectedCategoryId(category.id);
          setValue("categoryId", category.id);
          setCategoryPickerVisible(false);
        }}
        selectedCategoryId={selectedCategoryId}
        visible={categoryPickerVisible}
      />
      <ExpenseRecurrencePicker
        date={selectedDate}
        onClose={() => setRecurrencePickerVisible(false)}
        onConfirm={(date, rule) => {
          setSelectedDate(date);
          setSelectedRecurrence(rule);
          setValue("recurrence", recurrenceLabel(rule));
          setRecurrencePickerVisible(false);
        }}
        rule={selectedRecurrence}
        visible={recurrencePickerVisible}
      />
    </ScrollView>
  );
}

function Field({
  compact,
  error,
  icon,
  label,
  multiline,
  onPress,
  onChangeText,
  placeholder,
  selector,
  value,
}: FieldProps & { compact?: boolean }) {
  return (
    <View style={[styles.fieldGroup, compact && styles.compactField]}>
      <Pressable
        onPress={onPress}
        style={[styles.field, multiline && styles.multilineField, error && styles.fieldError]}
      >
        {icon}
        <View style={styles.fieldContent}>
          <Text style={styles.label}>{label}</Text>
          {selector ? (
            <Text style={styles.input}>{value || placeholder}</Text>
          ) : (
            <TextInput
              autoCapitalize="sentences"
              placeholder={placeholder}
              placeholderTextColor={colors.mutedLight}
              multiline={multiline}
              numberOfLines={multiline ? 3 : 1}
              style={[styles.input, multiline && styles.descriptionInput]}
              value={value}
              onChangeText={onChangeText}
            />
          )}
        </View>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: 14,
    padding: 20,
    paddingBottom: 140,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  back: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    width: 28,
  },
  headerCopy: { alignItems: "center", gap: 1 },
  headerTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 17 },
  headerStep: { color: colors.muted, fontSize: 12 },
  fieldGroup: {},
  compactField: { flex: 1 },
  row: { flexDirection: "row", gap: 10 },
  field: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 14,
  },
  fieldError: { borderColor: colors.negative },
  fieldContent: { flex: 1, gap: 1 },
  multilineField: { alignItems: "flex-start", minHeight: 82, paddingTop: 14 },
  label: { color: colors.mutedLight, fontSize: 12, fontWeight: "800" },
  input: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
    fontWeight: "800",
    padding: 0,
  },
  descriptionInput: { minHeight: 52, textAlignVertical: "top" },
  detailsLabel: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 12 },
  amountCard: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    minHeight: 100,
    padding: 16,
  },
  amountError: { borderColor: colors.negative, borderWidth: 2 },
  amountLabel: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 12 },
  amountInput: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 34,
    fontWeight: "900",
    marginTop: 2,
    padding: 0,
  },
  amountHint: { color: "#303030", fontSize: 12, marginTop: 2 },
  error: { color: colors.negative, fontSize: 12, marginTop: 3 },
  formError: { color: colors.negative, fontSize: 12, textAlign: "center" },
  disabled: { opacity: 0.55 },
  primary: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 16,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 58,
  },
  primaryText: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 15, fontWeight: "900" },
  cancel: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 54,
  },
  cancelText: { color: colors.text, fontSize: 14, fontWeight: "900" },
});
