"use client";

import { useEffect, useState } from "react";

type Props = {
  seconds?: number;
  onDone: () => void;
};

/** プレイ開始前の 3・2・1 カウントダウン。 */
export function Countdown({ seconds = 3, onDone }: Props) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left <= 0) {
      onDone();
      return;
    }
    const id = window.setTimeout(() => setLeft((n) => n - 1), 800);
    return () => window.clearTimeout(id);
  }, [left, onDone]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      {/* 背景に埋もれないよう、不透明なカードの上に置く */}
      <div className="flex flex-col items-center gap-4 rounded-xl bg-surface-container-low px-16 py-12 shadow-elev-3">
        <p className="text-sm font-medium tracking-widest text-on-surface-variant">
          READY
        </p>
        <div
          key={left}
          className="flex size-32 animate-key-pop items-center justify-center rounded-full bg-primary font-display text-7xl font-semibold tabular-nums text-on-primary shadow-elev-2"
          aria-live="assertive"
        >
          {left > 0 ? left : "GO"}
        </div>
        <p className="text-on-surface-variant">
          指をホームポジションに置いてください
        </p>
      </div>
    </div>
  );
}
