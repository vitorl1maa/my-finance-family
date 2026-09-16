import { Tabs } from 'expo-router';
import { ChartNoAxesColumn, Home, ReceiptText, Settings, Target } from 'lucide-react-native';

import { colors } from '@/src/shared/theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.mutedLight,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => (
            <Home color={color} size={22} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transacoes',
          tabBarIcon: ({ color }) => (
            <ReceiptText color={color} size={22} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Contas',
          tabBarIcon: ({ color }) => (
            <ChartNoAxesColumn color={color} size={22} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Metas',
          tabBarIcon: ({ color }) => (
            <Target color={color} size={22} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Mais',
          tabBarIcon: ({ color }) => (
            <Settings color={color} size={22} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen name="account-new" options={{ href: null }} />
      <Tabs.Screen name="expense-new" options={{ href: null }} />
    </Tabs>
  );
}
