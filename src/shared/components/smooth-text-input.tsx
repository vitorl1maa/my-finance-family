import { useEffect, useRef } from "react";
import { Animated, TextInput, type TextInputProps } from "react-native";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export function SmoothTextInput(props: TextInputProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (props.value === undefined) return;
    const animation = Animated.sequence([
      Animated.timing(opacity, { duration: 70, toValue: 0.72, useNativeDriver: true }),
      Animated.timing(opacity, { duration: 180, toValue: 1, useNativeDriver: true }),
    ]);

    animation.start();
    return () => animation.stop();
  }, [opacity, props.value]);

  return <AnimatedTextInput {...props} style={[props.style, { opacity }]} />;
}
