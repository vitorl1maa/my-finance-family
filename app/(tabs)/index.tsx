import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useDashboardViewModel } from '@/src/features/dashboard/view-model/use-dashboard-view-model';
import { colors } from '@/src/shared/theme/colors';
import { spacing } from '@/src/shared/theme/spacing';

export default function HomeScreen() {
  const viewModel = useDashboardViewModel();
  const router = useRouter();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ gap: spacing.xl, padding: spacing.xl }}>
      <View style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.muted, fontSize: 13 }}>Boa noite,</Text>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>
          Vitor e familia
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Pressable onPress={() => router.push('/account-new')} style={{ alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flex: 1, gap: spacing.xs, justifyContent: 'center', minHeight: 64 }}><Text style={{ fontSize: 22 }}>＋</Text><Text style={{ color: colors.text, fontSize: 13, fontWeight: '900' }}>Nova conta</Text></Pressable>
        <Pressable onPress={() => router.push('/expense-new')} style={{ alignItems: 'center', backgroundColor: colors.accent, borderRadius: 16, flex: 1, gap: spacing.xs, justifyContent: 'center', minHeight: 64 }}><Text style={{ color: colors.text, fontSize: 22 }}>−</Text><Text style={{ color: colors.text, fontSize: 13, fontWeight: '900' }}>Nova despesa</Text></Pressable>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>Total balance (BRL)</Text>
        <Text
          selectable
          style={{
            color: colors.text,
            fontSize: 34,
            fontVariant: ['tabular-nums'],
            fontWeight: '900',
          }}>
          {viewModel.totalBalance}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: colors.accent,
          borderCurve: 'continuous',
          borderRadius: 18,
          gap: spacing.sm,
          padding: spacing.lg,
        }}>
        <Text style={{ color: colors.text, fontSize: 12, fontWeight: '900' }}>
          PLANEJAMENTO FAMILIAR
        </Text>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '900' }}>
          Alcance seus objetivos financeiros em familia.
        </Text>
      </View>

      <View style={{ gap: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '900' }}>
          Minhas contas
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          {viewModel.accounts.map((account) => (
            <View
              key={account.id}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderCurve: 'continuous',
                borderRadius: 16,
                borderWidth: 1,
                flex: 1,
                gap: spacing.sm,
                padding: spacing.md,
              }}>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{account.name}</Text>
              <Text selectable style={{ color: colors.text, fontSize: 16, fontWeight: '900' }}>
                {account.formattedBalance}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '900' }}>
          Movimentacoes
        </Text>
        {viewModel.recentTransactions.map((transaction) => (
          <View
            key={transaction.id}
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '800' }}>
                {transaction.title}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{transaction.category}</Text>
            </View>
            <Text
              selectable
              style={{
                color: transaction.isExpense ? colors.negative : colors.positive,
                fontSize: 14,
                fontVariant: ['tabular-nums'],
                fontWeight: '900',
              }}>
              {transaction.formattedAmount}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
