import { CalendarDays, CircleCheck, Flag, Plus, Target, WalletCards } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { GoalNewView } from "@/src/features/goals/view/goal-new-view";
import { useGoalsViewModel } from "@/src/features/goals/view-model/use-goals-view-model";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export default function GoalsScreen() {
  const [goalDrawerVisible, setGoalDrawerVisible] = useState(false);
  const { goals } = useGoalsViewModel();
  const totalTarget = goals.reduce((total, goal) => total + goal.targetCents, 0);
  const totalSaved = goals.reduce((total, goal) => total + goal.savedCents, 0);
  const overallProgress = totalTarget ? Math.min(1, totalSaved / totalTarget) : 0;
  const completedGoals = goals.filter((goal) => goal.status === "Concluída").length;

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Metas</Text>
          <Text style={styles.subtitle}>Dê um propósito para cada conquista</Text>
        </View>
        <Pressable
          accessibilityLabel="Adicionar nova meta"
          accessibilityRole="button"
          onPress={() => setGoalDrawerVisible(true)}
          style={styles.headerIcon}
        >
          <Plus color={colors.text} size={24} strokeWidth={2.4} />
        </Pressable>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryEyebrow}>PROGRESSO GERAL</Text>
            <Text style={styles.summaryAmount}>{formatPercent(overallProgress)}</Text>
          </View>
          <View style={styles.summaryBadge}>
            <Flag color={colors.text} size={15} />
            <Text style={styles.summaryBadgeText}>
              {goals.length} {goals.length === 1 ? "meta" : "metas"}
            </Text>
          </View>
        </View>
        <View style={styles.summaryTrack}>
          <View style={[styles.summaryFill, { width: `${overallProgress * 100}%` }]} />
        </View>
        <View style={styles.summaryFooter}>
          <Text style={styles.summarySaved}>{formatCurrency(totalSaved)} acumulados</Text>
          <Text style={styles.summaryTarget}>de {formatCurrency(totalTarget)}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Suas metas</Text>
        <Text style={styles.sectionCount}>
          {completedGoals} concluída{completedGoals === 1 ? "" : "s"}
        </Text>
      </View>

      {goals.length === 0 ? (
        <View style={styles.empty}>
          <Target color={colors.mutedLight} size={26} />
          <Text style={styles.emptyTitle}>Nenhuma meta criada</Text>
          <Text style={styles.emptyText}>Quando você criar uma meta, ela aparecerá aqui.</Text>
        </View>
      ) : (
        goals.map((goal) => <GoalCard goal={goal} key={goal.id} />)
      )}
      <Modal
        animationType="slide"
        onRequestClose={() => setGoalDrawerVisible(false)}
        transparent
        visible={goalDrawerVisible}
      >
        <View style={styles.drawerBackdrop}>
          <View style={styles.drawer}>
            <GoalNewView onBack={() => setGoalDrawerVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function GoalCard({ goal }: { goal: ReturnType<typeof useGoalsViewModel>["goals"][number] }) {
  const isCompleted = goal.status === "Concluída";
  const isAttention = goal.status === "Atenção";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.goalIcon, isCompleted && styles.completedIcon]}>
          {isCompleted ? (
            <CircleCheck color={colors.text} size={21} />
          ) : (
            <WalletCards color={colors.text} size={21} />
          )}
        </View>
        <View style={styles.goalHeading}>
          <Text style={styles.goalCategory}>
            {goal.category} · Prioridade {goal.priority}
          </Text>
          <Text style={styles.goalTitle}>{goal.title}</Text>
        </View>
        <View
          style={[
            styles.status,
            isAttention && styles.attentionStatus,
            isCompleted && styles.completedStatus,
          ]}
        >
          <Text style={styles.statusText}>{goal.status}</Text>
        </View>
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.savedValue}>{goal.formattedSaved}</Text>
        <Text style={styles.targetValue}>de {goal.formattedTarget}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            isAttention && styles.attentionFill,
            { width: `${goal.progress * 100}%` },
          ]}
        />
      </View>
      <View style={styles.progressMeta}>
        <Text style={styles.progressPercent}>{formatPercent(goal.progress)} concluído</Text>
        <Text style={styles.remaining}>{goal.formattedRemaining} restantes</Text>
      </View>
      <View style={styles.detailGrid}>
        <Detail
          icon={<CalendarDays color={colors.muted} size={16} />}
          label="Prazo"
          value={goal.formattedDueDate}
        />
        <Detail
          icon={<Target color={colors.muted} size={16} />}
          label="Guardar por mês"
          value={goal.formattedMonthlyGoal}
        />
      </View>
    </View>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.detail}>
      {icon}
      <View>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { currency: "BRL", style: "currency" }).format(value / 100);
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  content: { flexGrow: 1, gap: 16, padding: 20, paddingBottom: 140, paddingTop: 58 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  title: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 28 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 2 },
  headerIcon: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 18,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  summaryCard: { backgroundColor: colors.text, borderRadius: 22, gap: 16, padding: 18 },
  summaryTop: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  summaryEyebrow: {
    color: colors.accent,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  summaryAmount: { color: colors.surface, fontFamily: fonts.extraBold, fontSize: 32, marginTop: 3 },
  summaryBadge: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 14,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  summaryBadgeText: { color: colors.text, fontFamily: fonts.bold, fontSize: 11 },
  summaryTrack: { backgroundColor: "#3A3A3A", borderRadius: 99, height: 9, overflow: "hidden" },
  summaryFill: { backgroundColor: colors.accent, borderRadius: 99, height: 9 },
  summaryFooter: { flexDirection: "row", justifyContent: "space-between" },
  summarySaved: { color: colors.surface, fontFamily: fonts.bold, fontSize: 12 },
  summaryTarget: { color: "#A3A3A3", fontSize: 12 },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  sectionTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 17 },
  sectionCount: { color: colors.muted, fontSize: 12 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  cardHeader: { alignItems: "center", flexDirection: "row", gap: 10 },
  goalIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 15,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  completedIcon: { backgroundColor: colors.accent },
  goalHeading: { flex: 1, gap: 2 },
  goalCategory: { color: colors.muted, fontSize: 11 },
  goalTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 15 },
  status: {
    backgroundColor: "#EAF8D0",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  attentionStatus: { backgroundColor: "#FFF1D5" },
  completedStatus: { backgroundColor: colors.accent },
  statusText: { color: colors.text, fontFamily: fonts.bold, fontSize: 10 },
  valueRow: { alignItems: "baseline", flexDirection: "row", gap: 5 },
  savedValue: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 20 },
  targetValue: { color: colors.muted, fontSize: 12 },
  progressTrack: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 99,
    height: 9,
    overflow: "hidden",
  },
  progressFill: { backgroundColor: colors.accent, borderRadius: 99, height: 9 },
  attentionFill: { backgroundColor: "#F3B23C" },
  progressMeta: { flexDirection: "row", justifyContent: "space-between" },
  progressPercent: { color: colors.muted, fontFamily: fonts.bold, fontSize: 11 },
  remaining: { color: colors.muted, fontSize: 11 },
  detailGrid: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 18,
    paddingTop: 12,
  },
  detail: { alignItems: "center", flex: 1, flexDirection: "row", gap: 7 },
  detailLabel: { color: colors.muted, fontSize: 10 },
  detailValue: { color: colors.text, fontFamily: fonts.bold, fontSize: 12, marginTop: 2 },
  empty: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    gap: 8,
    padding: 28,
  },
  emptyTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
  emptyText: { color: colors.muted, fontSize: 12, textAlign: "center" },
  drawerBackdrop: { backgroundColor: "rgba(0, 0, 0, 0.32)", flex: 1, justifyContent: "flex-end" },
  drawer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    overflow: "hidden",
  },
});
