"use client";

import { useEffect, useRef, useState } from "react";
import { Square } from "lucide-react";
import { TimerMeter } from "@/features/timer/components/TimerMeter";
import { KeyboardTargets } from "./KeyboardTargets";
import { StatsBar } from "@/features/scoring/components/StatsBar";
import type { Flash, GameSnapshot } from "../types";
import type { ModeSize } from "@/shared/types";

type Props = {
  mode: ModeSize;
  state: GameSnapshot;
  flash: Flash | null;
  onQuit: () => void;
};

export function GameScreen({ mode, state, flash, onQuit }: Props) {
  const [shakeKey, setShakeKey] = useState(0);
  const lastFlashId = useRef(0);

  useEffect(() => {
    if (flash && flash.id !== lastFlashId.current) {
      lastFlashId.current = flash.id;
      if (flash.kind === "miss") setShakeKey((n) => n + 1);
    }
  }, [flash]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-secondary-container px-4 py-1.5 text-sm font-medium text-on-secondary-container">
          {mode} 文字モード
        </span>
        <button
          onClick={onQuit}
          className="m3-state-layer flex items-center gap-2 rounded-full border border-outline px-4 py-2 text-sm font-medium text-on-surface-variant"
        >
          <Square className="size-4" aria-hidden />
          中断して終了
        </button>
      </div>

      <div className="sticky top-2 z-10">
        <TimerMeter timeLeftMs={state.timeLeftMs} totalTimeMs={state.totalTimeMs} />
      </div>

      <section
        className={[
          "relative rounded-xl bg-surface-container-low px-6 py-10 shadow-elev-2",
          flash?.kind === "miss" ? "" : "",
        ].join(" ")}
      >
        <div key={shakeKey} className={shakeKey ? "animate-shake-x" : undefined}>
          <KeyboardTargets
            targets={state.targets}
            pressed={state.pressed}
            windowProgress={state.windowProgress}
            shakeKey={shakeKey}
          />
        </div>

        {/* 成功/ミスのフィードバック */}
        {flash && (
          <div
            key={flash.id}
            className="pointer-events-none absolute inset-x-0 top-3 flex animate-float-up flex-col items-center"
            aria-live="polite"
          >
            <span
              className={[
                "rounded-full px-4 py-1 text-lg font-semibold",
                flash.kind === "success"
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-error-container text-on-error-container",
              ].join(" ")}
            >
              {flash.text}
            </span>
            {flash.sub && (
              <span className="mt-1 text-xs text-on-surface-variant">{flash.sub}</span>
            )}
          </div>
        )}
      </section>

      <StatsBar
        score={state.score}
        combo={state.combo}
        multiplier={state.multiplier}
        noMissStreak={state.noMissStreak}
        successCount={state.successCount}
        missCount={state.missCount}
      />

      <p className="text-center text-sm text-on-surface-variant">
        表示された {mode} 文字を、最初の 1 キーから 0.5 秒以内にすべて押してください。
      </p>
    </div>
  );
}
