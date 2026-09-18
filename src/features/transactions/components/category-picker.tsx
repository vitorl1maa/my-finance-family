import { Check, X } from "lucide-react-native";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import type { ExpenseCategory } from "@/src/features/categories/model/expense-category";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

type CategoryPickerProps = {
  categories: ExpenseCategory[];
  errorMessage?: string;
  loading?: boolean;
  selectedCategoryId: string;
  visible: boolean;
  onClose: () => void;
  onRetry: () => void;
  onSelect: (category: ExpenseCategory) => void;
};

export function CategoryPicker({
  categories,
  errorMessage,
  loading,
  selectedCategoryId,
  visible,
  onClose,
  onRetry,
  onSelect,
}: CategoryPickerProps) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Categoria</Text>
              <Text style={styles.subtitle}>Escolha onde esse gasto se encaixa</Text>
            </View>
            <Pressable
              accessibilityLabel="Fechar categorias"
              onPress={onClose}
              style={styles.close}
            >
              <X color={colors.text} size={20} />
            </Pressable>
          </View>
          {loading ? <Text style={styles.feedback}>Carregando categorias...</Text> : null}
          {errorMessage && categories.length === 0 ? (
            <View style={styles.feedbackBlock}>
              <Text style={styles.feedback}>{errorMessage}</Text>
              <Pressable onPress={onRetry} style={styles.retry}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : null}
          {!loading && categories.length > 0 ? (
            <View style={styles.options}>
              {categories.map((category) => {
                const selected = category.id === selectedCategoryId;

                return (
                  <Pressable
                    key={category.id}
                    onPress={() => onSelect(category)}
                    style={[styles.option, selected && styles.selectedOption]}
                  >
                    <Text style={styles.optionText}>{category.name}</Text>
                    {selected ? <Check color={colors.text} size={18} /> : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
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
  options: { gap: 8, marginTop: 20 },
  option: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: 16,
  },
  selectedOption: { backgroundColor: colors.accent, borderColor: colors.accent },
  optionText: { color: colors.text, fontFamily: fonts.semiBold, fontSize: 14 },
  feedbackBlock: { alignItems: "center", gap: 14, marginTop: 24 },
  feedback: { color: colors.muted, fontSize: 13, marginTop: 22, textAlign: "center" },
  retry: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryText: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
});
