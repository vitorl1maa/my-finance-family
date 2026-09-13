import { ScrollView, Text, View } from 'react-native';

import { useGoalsViewModel } from '@/src/features/goals/view-model/use-goals-view-model';
import { colors } from '@/src/shared/theme/colors';
import { spacing } from '@/src/shared/theme/spacing';

export default function GoalsScreen() {
  const viewModel = useGoalsViewModel();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ gap: spacing.lg, padding: spacing.xl }}>
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900' }}>Metas</Text>

      {viewModel.goals.map((goal) => (
        <View
          key={goal.id}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderCurve: 'continuous',
            borderRadius: 18,
            borderWidth: 1,
            gap: spacing.md,
            padding: spacing.lg,
          }}>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '900' }}>
            {goal.title}
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 13 }}>
            {goal.formattedSaved} de {goal.formattedTarget}
          </Text>
          <View
            style={{
              backgroundColor: colors.surfaceMuted,
              borderRadius: 999,
              height: 10,
              overflow: 'hidden',
            }}>
            <View
              style={{
                backgroundColor: colors.accent,
                height: 10,
                width: `${Math.round(goal.progress * 100)}%`,
              }}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
