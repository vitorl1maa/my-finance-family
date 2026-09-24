import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type React from "react";
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

type SplitViewRootProps = {
  children: React.ReactNode;
  initialTopHeight: number;
  minTopHeight: number;
  minBottomHeight: number;
  gap?: number;
  onHeightChange?: (height: number) => void;
  snapPoints: number[];
  style?: StyleProp<ViewStyle>;
};

type SplitViewPaneProps = { children: React.ReactNode; style?: StyleProp<ViewStyle> };

type SplitViewHandleProps = {
  color?: string;
  barStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

type SplitViewContextValue = { height: number; panHandlers: ReturnType<typeof PanResponder.create>["panHandlers"] };

const SplitViewContext = createContext<SplitViewContextValue | null>(null);

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getSnapPoint(height: number, velocity: number, points: number[]): number {
  if (Math.abs(velocity) > 0.75) {
    const directed = velocity > 0 ? points.find((point) => point > height) : [...points].reverse().find((point) => point < height);
    if (directed !== undefined) return directed;
  }

  return points.reduce((closest, point) =>
    Math.abs(point - height) < Math.abs(closest - height) ? point : closest,
  );
}

function Root({
  children,
  initialTopHeight,
  minTopHeight,
  minBottomHeight,
  gap = 20,
  onHeightChange,
  snapPoints,
  style,
}: SplitViewRootProps) {
  const [containerHeight, setContainerHeight] = useState(0);
  const [height, setHeight] = useState(initialTopHeight);
  const startHeight = useRef(initialTopHeight);
  const maxTopHeight = Math.max(minTopHeight, containerHeight - minBottomHeight - gap);
  const interaction = useRef({ height: initialTopHeight, maxTopHeight, minTopHeight, snapPoints });
  const onHeightChangeRef = useRef(onHeightChange);
  interaction.current = { height, maxTopHeight, minTopHeight, snapPoints };
  onHeightChangeRef.current = onHeightChange;

  const setTopHeight = useCallback((nextHeight: number) => {
    interaction.current.height = nextHeight;
    setHeight(nextHeight);
    onHeightChangeRef.current?.(nextHeight);
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          startHeight.current = interaction.current.height;
        },
        onPanResponderMove: (_, gesture) => {
          const { maxTopHeight: max, minTopHeight: min } = interaction.current;
          setTopHeight(clamp(startHeight.current + gesture.dy, min, max));
        },
        onPanResponderRelease: (_, gesture) => {
          const { maxTopHeight: max, minTopHeight: min, snapPoints: configuredPoints } = interaction.current;
          const points = configuredPoints.filter((point) => point >= min && point <= max).sort((left, right) => left - right);
          const current = clamp(startHeight.current + gesture.dy, min, max);
          setTopHeight(getSnapPoint(current, gesture.vy, points.length > 0 ? points : [min]));
        },
      }),
    [setTopHeight],
  );

  const onLayout = (event: LayoutChangeEvent) => {
    const nextContainerHeight = event.nativeEvent.layout.height;
    const nextMax = Math.max(minTopHeight, nextContainerHeight - minBottomHeight - gap);
    setContainerHeight(nextContainerHeight);
    setTopHeight(clamp(interaction.current.height, minTopHeight, nextMax));
  };

  return (
    <SplitViewContext.Provider value={{ height, panHandlers: panResponder.panHandlers }}>
      <View onLayout={onLayout} style={[styles.root, style]}>{children}</View>
    </SplitViewContext.Provider>
  );
}

function useSplitView(): SplitViewContextValue {
  const context = useContext(SplitViewContext);
  if (!context) throw new Error("SplitView components must be rendered inside SplitView.Root.");
  return context;
}

function Top({ children, style }: SplitViewPaneProps) {
  const { height } = useSplitView();
  return <View style={[styles.top, { height }, style]}>{children}</View>;
}

function Handle({ color, barStyle, style }: SplitViewHandleProps) {
  const { panHandlers } = useSplitView();
  return (
    <View {...panHandlers} style={[styles.handle, style]}>
      <View style={[styles.handleBar, { backgroundColor: color }, barStyle]} />
    </View>
  );
}

function Bottom({ children, style }: SplitViewPaneProps) {
  return <View style={[styles.bottom, style]}>{children}</View>;
}

function Title({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export const SplitView = Object.assign(Root, { Bottom, Handle, Root, Title, Top });

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: { overflow: "hidden" },
  bottom: { flex: 1, overflow: "hidden" },
  handle: { alignItems: "center", height: 44, justifyContent: "center", width: "100%" },
  handleBar: { borderRadius: 3, height: 5, width: 44 },
  title: { fontSize: 15, fontWeight: "600", paddingHorizontal: 16, paddingVertical: 8 },
});
