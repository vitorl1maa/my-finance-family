import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "expo-router";
import { Bell, CircleDollarSign, Send } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CashflowChart } from "@/src/features/dashboard/components/cashflow-chart";
import { SpendingBreakdown } from "@/src/features/dashboard/components/spending-breakdown";
import { WeeklyCalendar } from "@/src/features/dashboard/components/weekly-calendar";
import { WelcomeBanner } from "@/src/features/dashboard/components/welcome-banner";
import { useDashboardViewModel } from "@/src/features/dashboard/view-model/use-dashboard-view-model";
import { GradientAvatar } from "@/src/shared/components/base/gradient-avatar";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

type DashboardViewProps = Record<string, never>;

export function DashboardView(_: DashboardViewProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const { greeting, insights, recentTransactions, totalBalance, userName } =
    useDashboardViewModel(selectedDate);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.profile}>
          <Pressable
            accessibilityLabel="Editar perfil"
            onPress={() => router.push("/edit-profile")}
          >
            <GradientAvatar
              palette={[colors.accent, colors.text, colors.surfaceMuted]}
              sheen={false}
              size={42}
              token={userName}
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

      <WeeklyCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>COFRINHO</Text>
        <Text style={styles.total}>{totalBalance}</Text>
        <View style={styles.summaryStats}>
          <Metric
            label="Entradas no mês"
            value={`+ ${formatCurrencyFromCents(insights.monthlyIncomeCents)}`}
          />
          <Metric
            accent
            label="Despesas no mês"
            value={`- ${formatCurrencyFromCents(insights.monthlyExpenseCents)}`}
          />
        </View>
      </View>

      <WelcomeBanner />
      <CashflowChart data={insights.weeklyCashflow} />
      <SpendingBreakdown categories={insights.expenseByCategory} />

      <SectionHeader action="Ver todas" title="Últimas transações" />
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
  );
}

function formatTransactionDate(value: string): string {
  const date = new Date(value);
  if (isToday(date)) return `Hoje · ${format(date, "HH:mm")}`;
  return `${format(date, "dd MMM", { locale: ptBR })} · ${format(date, "HH:mm")}`;
}

function Metric({ accent, label, value }: { accent?: boolean; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, accent && styles.metricAccent]}>{value}</Text>
    </View>
  );
}

function SectionHeader({ action, title }: { action: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable accessibilityRole="button">
        <Text style={styles.sectionAction}>{action} ›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  content: { gap: 14, paddingBottom: 140, paddingHorizontal: 20, paddingTop: 60 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  profile: { alignItems: "center", flexDirection: "row", gap: 10 },
  greeting: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 18 },
  notification: { alignItems: "center", height: 42, justifyContent: "center", width: 34 },
  summary: { backgroundColor: colors.text, borderRadius: 20, gap: 8, padding: 16 },
  summaryLabel: { color: colors.accent, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.3 },
  total: { color: colors.surface, fontFamily: fonts.extraBold, fontSize: 32, letterSpacing: -0.5 },
  summaryStats: { flexDirection: "row", gap: 160 },
  metric: { flex: 1, gap: 3 },
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
