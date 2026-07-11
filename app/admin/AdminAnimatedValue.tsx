"use client";

import { useEffect, useState } from "react";

export type AdminAnimatedValueFormat = "integer" | "compactCurrency" | "nullableCompactCurrency";

function formatAnimatedValue(value: number, format: AdminAnimatedValueFormat) {
  if (format === "compactCurrency" || format === "nullableCompactCurrency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: value >= 100 ? 0 : 2,
    }).format(value);
  }

  return Math.round(value).toLocaleString("en-US");
}

export function AdminAnimatedValue({
  value,
  format = "integer",
  emptyLabel,
}: {
  value: number;
  format?: AdminAnimatedValueFormat;
  emptyLabel?: string;
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

  if (emptyLabel && value === 0) {
    return <>{emptyLabel}</>;
  }

  return <>{formatAnimatedValue(displayValue, format)}</>;
}
