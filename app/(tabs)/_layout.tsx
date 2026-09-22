import { Tabs } from "expo-router";
import {
  BanknoteArrowDown,
  Home,
  PiggyBank,
  Target,
  TrendingUp,
  UsersRound,
} from "lucide-react-native";
import type { ComponentProps } from "react";

import { FloatingBottomTabs } from "@/src/shared/components/base/floating-bottom-tabs";
import { colors } from "@/src/shared/theme/colors";

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
      }}
      tabBar={(props) => (
        <FloatingBottomTabs {...(props as unknown as ComponentProps<typeof FloatingBottomTabs>)} />
      )}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => <Home color={color} size={22} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="cofrinho"
        options={{
          title: "Cofrinho",
          tabBarIcon: ({ color }) => <PiggyBank color={color} size={22} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="expense-new"
        options={{
          title: "Despesas",
          tabBarIcon: ({ color }) => (
            <BanknoteArrowDown color={color} size={22} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Metas",
          tabBarIcon: ({ color }) => <Target color={color} size={22} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transações",
          tabBarIcon: ({ color }) => <TrendingUp color={color} size={22} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="family-members"
        options={{
          title: "Família",
          tabBarIcon: ({ color }) => <UsersRound color={color} size={22} strokeWidth={2.4} />,
        }}
      />
    </Tabs>
  );
}
