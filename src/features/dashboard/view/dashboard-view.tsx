import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "expo-router";
import { Bell, CircleDollarSign, Send } from "lucide-react-native";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { CashflowChart } from "@/src/features/dashboard/components/cashflow-chart";
import { ProfileAvatar } from "@/src/features/auth/components/profile-avatar";
import {
  getAvatarToken,
  type ProfileAvatarMetadata,
} from "@/src/features/auth/model/profile-avatar";
import { useAuthStore } from "@/src/features/auth/store/auth-store";
import { EmptyPiggyBankBanner } from "@/src/features/dashboard/components/empty-piggy-bank-banner";
import { SpendingBreakdown } from "@/src/features/dashboard/components/spending-breakdown";
import { WeeklyCalendar } from "@/src/features/dashboard/components/weekly-calendar";
import { shouldShowEmptyPiggyBankBanner } from "@/src/features/dashboard/model/dashboard-state";
import { useDashboardViewModel } from "@/src/features/dashboard/view-model/use-dashboard-view-model";
import { AnimatedCurrency } from "@/src/shared/components/animated-currency";
import { SplitView } from "@/src/shared/components/base/split-view";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

type DashboardViewProps = Record<string, never>;

export function DashboardView(_: DashboardViewProps) {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const {
    greeting,
    incomeSources,
    incomeSourcesLoading,
    insights,
    loading,
    recentTransactions,
    reload,
    totalBalanceCents,
    userName,
  } = useDashboardViewModel(selectedDate);
  const isPiggyBankEmpty = shouldShowEmptyPiggyBankBanner(
    incomeSourcesLoading,
    incomeSources.length,
  );
  const avatarMetadata = session?.user.user_metadata as ProfileAvatarMetadata | undefined;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profile}>
          <Pressable
            accessibilityLabel="Editar perfil"
            onPress={() => router.push("/edit-profile")}
          >
            <ProfileAvatar
              avatarUrl={avatarMetadata?.avatar_url}
              size={42}
              token={getAvatarToken(avatarMetadata, userName)}
            />
          </Pressable>
          <Text style={styles.greeting}>
            {greeting.replace(",", "")} {userName}
          </Text>
        </View>
        <Pressable accessibilityLabel="Notificações" style={styles.notification}>
          <Bell color={colors.text} size={22} strokeWidth={2} />
        </Pressable>
      </View>
      <SplitView.Root
        gap={20}
        initialTopHeight={108}
        minBottomHeight={180}
        minTopHeight={108}
        onHeightChange={(height) => setCalendarExpanded(height > 200)}
        snapPoints={[108, 230, 340]}
        style={styles.splitView}
      >
        <SplitView.Top style={styles.calendarPane}>
          <WeeklyCalendar
            nextExpense={insights.nextExpense}
            scheduledExpenses={insights.scheduledExpenses}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            expanded={calendarExpanded}
          />
        </SplitView.Top>
        <SplitView.Handle barStyle={styles.splitHandle} color={colors.border} />
        <SplitView.Bottom style={styles.dashboardPane}>
          <ScrollView
            contentContainerStyle={styles.content}
            contentInsetAdjustmentBehavior="automatic"
            refreshControl={
              <RefreshControl
                colors={[colors.darkPink]}
                onRefresh={reload}
                refreshing={loading}
                tintColor={colors.darkPink}
              />
            }
          >
            {totalBalanceCents > 0 ? (
              <View style={styles.summary}>
                <Text style={styles.summaryLabel}>CARTEIRA</Text>
                <AnimatedCurrency style={styles.total} valueInCents={totalBalanceCents} />
                <View style={styles.summaryStats}>
                  <Metric
                    label="Entradas no mês"
                    prefix="+ "
                    valueInCents={incomeSources.reduce((total, source) => total + source.amountCents, 0)}
                  />
                  <Metric
                    accent
                    label="Despesas no mês"
                    prefix="- "
                    valueInCents={insights.monthlyExpenseCents}
                  />
                </View>
              </View>
            ) : null}

            {isPiggyBankEmpty ? (
              <EmptyPiggyBankBanner onPress={() => router.push("/(tabs)/cofrinho")} />
            ) : null}
            <CashflowChart data={insights.weeklyCashflow} />
            <SpendingBreakdown categories={insights.expenseByCategory} />

            <SectionHeader
              action="Ver todas"
              title="Últimas transações"
              onActionPress={() => router.push("/(tabs)/transactions")}
            />
            <View style={styles.transactions}>
              {recentTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transaction}>
                  <View
                    style={[
                      styles.transactionIcon,
                      transaction.isExpense ? styles.expenseIcon : styles.incomeIcon,
                    ]}
                  >
                    {transaction.isExpense ? (
                      <Send color={colors.text} size={14} />
                    ) : (
                      <CircleDollarSign color={colors.text} size={14} />
                    )}
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>{transaction.title}</Text>
                    <Text style={styles.transactionDate}>
                      {transaction.category} · {formatTransactionDate(transaction.occurredAt)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      transaction.isExpense ? styles.expenseText : styles.incomeText,
                    ]}
                  >
                    {transaction.formattedAmount}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </SplitView.Bottom>
      </SplitView.Root>
    </View>
  );
}

function formatTransactionDate(value: string): string {
  const date = new Date(value);
  if (isToday(date)) return `Hoje · ${format(date, "HH:mm")}`;
  return `${format(date, "dd MMM", { locale: ptBR })} · ${format(date, "HH:mm")}`;
}

function Metric({
  accent,
  label,
  prefix,
  valueInCents,
}: {
  accent?: boolean;
  label: string;
  prefix: string;
  valueInCents: number;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricAmount}>
        <Text style={[styles.metricValue, accent && styles.metricAccent]}>{prefix}</Text>
        <AnimatedCurrency
          style={[styles.metricValue, accent && styles.metricAccent]}
          valueInCents={valueInCents}
        />
      </View>
    </View>
  );
}

function SectionHeader({
  action,
  onActionPress,
  title,
}: {
  action: string;
  onActionPress: () => void;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable accessibilityLabel={action} accessibilityRole="button" onPress={onActionPress}>
        <Text style={styles.sectionAction}>{action} ›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1, paddingTop: 60 },
  splitView: { backgroundColor: colors.background, flex: 1 },
  calendarPane: { backgroundColor: colors.background },
  dashboardPane: { backgroundColor: colors.background },
  splitHandle: { backgroundColor: colors.border },
  content: { gap: 14, paddingBottom: 140, paddingHorizontal: 20, paddingTop: 10 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  profile: { alignItems: "center", flexDirection: "row", gap: 10 },
  greeting: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 18 },
  notification: { alignItems: "center", height: 42, justifyContent: "center", width: 34 },
  summary: { backgroundColor: colors.text, borderRadius: 20, gap: 8, padding: 16 },
  summaryLabel: { color: colors.accent, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.3 },
  total: { color: colors.surface, fontFamily: fonts.extraBold, fontSize: 32, letterSpacing: -0.5 },
  summaryStats: { flexDirection: "row", gap: 160 },
  metric: { flex: 1, gap: 3 },
  metricAmount: { alignItems: "center", flexDirection: "row" },
  metricLabel: { color: "#A3A3A3", fontSize: 12 },
  metricValue: { color: colors.surface, fontFamily: fonts.bold, fontSize: 13 },
  metricAccent: { color: colors.accent },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  sectionTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 15 },
  sectionAction: { color: colors.muted, fontFamily: fonts.bold, fontSize: 12 },
  transactions: {
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 0,
    paddingHorizontal: 12,
  },
  transaction: { alignItems: "center", flexDirection: "row", minHeight: 58 },
  transactionIcon: {
    alignItems: "center",
    borderRadius: 18,
    height: 34,
    justifyContent: "center",
    marginRight: 10,
    width: 34,
  },
  expenseIcon: { backgroundColor: colors.surfaceMuted },
  incomeIcon: { backgroundColor: colors.accent },
  transactionInfo: { flex: 1, gap: 3 },
  transactionTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 12 },
  transactionDate: { color: colors.muted, fontSize: 12 },
  transactionAmount: { fontFamily: fonts.bold, fontSize: 12 },
  expenseText: { color: colors.negative },
  incomeText: { color: colors.positive },
});
