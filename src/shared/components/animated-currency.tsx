import { useEffect, useRef, useState } from "react";
import { Text, type TextProps } from "react-native";

import { formatCurrencyFromCents } from "@/src/shared/utils/money";

const animationDurationMs = 650;

export function AnimatedCurrency({ valueInCents, ...props }: { valueInCents: number } & TextProps) {
  const previousValue = useRef(0);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const from = previousValue.current;
    const to = valueInCents;
    previousValue.current = to;

    if (from === to) {
      setAnimatedValue(to);
      return;
    }

    const startedAt = Date.now();
    let frame: number;
    const tick = () => {
      const progress = Math.min(1, (Date.now() - startedAt) / animationDurationMs);
      const eased = 1 - (1 - progress) ** 3;
      setAnimatedValue(Math.round(from + (to - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [valueInCents]);

  return <Text {...props}>{formatCurrencyFromCents(animatedValue)}</Text>;
}
