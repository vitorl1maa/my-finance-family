import { Tabs } from "expo-router";
import { BanknoteArrowUp, Home, PiggyBank, ReceiptText, Target } from "lucide-react-native";
import type { ComponentProps } from "react";

import { CurvedBottomTabs } from "@/src/shared/components/base/curved-bottom-tabs";
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
      tabBar={(props) => {
        const curvedTabsProps = {
          ...props,
          gradients: [colors.text, colors.text],
        } as unknown as ComponentProps<typeof CurvedBottomTabs>;

        return <CurvedBottomTabs {...curvedTabsProps} />;
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => <Home color={color} size={22} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transacoes",
          tabBarIcon: ({ color }) => <ReceiptText color={color} size={22} strokeWidth={2.4} />,
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
        name="expense-new"
        options={{
          title: "Despesas",
          tabBarIcon: ({ color }) => <BanknoteArrowUp color={color} size={22} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="cofrinho"
        options={{
          title: "Cofrinho",
          tabBarIcon: ({ color }) => <PiggyBank color={color} size={22} strokeWidth={2.4} />,
        }}
      />
    </Tabs>
  );
}
