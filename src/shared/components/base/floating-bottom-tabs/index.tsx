import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export function FloatingBottomTabs({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { bottom: Math.max(insets.bottom, 12) }]}
    >
      <View style={styles.bar}>
        {state.routes.filter((route) => route.name !== "goals").map((route) => {
          const { options } = descriptors[route.key];
          const focused = state.routes[state.index]?.key === route.key;
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : (options.title ?? route.name);
          const icon = options.tabBarIcon?.({
            focused,
            color: focused ? colors.text : colors.mutedLight,
            size: 21,
          });

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          return (
            <Pressable
              accessibilityLabel={label}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              key={route.key}
              onPress={onPress}
              style={styles.item}
            >
              {icon}
              <Text style={[styles.label, focused ? styles.labelActive : styles.labelInactive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { left: 20, position: "absolute", right: 20 },
  bar: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: "#E8E8E8",
    borderRadius: 32,
    borderWidth: 1,
    elevation: 5,
    flexDirection: "row",
    gap: 4,
    minHeight: 58,
    paddingHorizontal: 5,
    paddingVertical: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  item: {
    alignItems: "center",
    borderRadius: 22,
    flex: 1,
    gap: 3,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 2,
  },
  label: { fontFamily: fonts.regular, fontSize: 10, textAlign: "center" },
  labelActive: { color: colors.text, fontFamily: fonts.bold },
  labelInactive: { color: colors.mutedLight },
});
