"use client";

import { useEffect, useState } from "react";

export function AdminAnimatedValue({
  value,
  formatter,
}: {
  value: number;
  formatter?: (value: number) => string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const targetValue = Number.isFinite(value) ? value : 0;
    const durationMs = 700;
    const startTime = performance.now();
    const startValue = 0;
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayValue(startValue + (targetValue - startValue) * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{formatter ? formatter(displayValue) : Math.round(displayValue).toLocaleString("en-US")}</>;
}
