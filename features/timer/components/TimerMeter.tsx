"use client";

import { Timer, TriangleAlert } from "lucide-react";
import { formatSeconds } from "@/shared/format";

type Props = {
  timeLeftMs: number;
  totalTimeMs: number;
};

/**
 * 残り時間メーター。M3 の linear progress indicator に倣い、
 * トラック(surface-container-highest)+ インジケータの 2 層で構成する。
 */
export function TimerMeter({ timeLeftMs, totalTimeMs }: Props) {
  const ratio = totalTimeMs > 0 ? Math.min(1, Math.max(0, timeLeftMs / totalTimeMs)) : 0;
  const seconds = timeLeftMs / 1000;
  const danger = seconds <= 10;
  const caution = !danger && seconds <= 20;

  const indicator = danger
    ? "bg-error"
    : caution
      ? "bg-tertiary"
      : "bg-primary";

  return (
    <section
      aria-label="残り時間"
      className="rounded-xl bg-surface-container-low p-5 shadow-elev-1"
    >
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-center gap-2 text-on-surface-variant">
          {danger ? (
            <TriangleAlert className="size-5 text-error" aria-hidden />
          ) : (
            <Timer className="size-5" aria-hidden />
          )}
          <span className="text-sm font-medium tracking-wide">TIME LEFT</span>
        </div>
        <div className="flex items-baseline gap-1 tabular-nums">
          <span
            className={`text-4xl font-semibold leading-none ${
              danger ? "text-error" : "text-on-surface"
            }`}
          >
            {formatSeconds(timeLeftMs)}
          </span>
          <span className="text-sm text-on-surface-variant">s</span>
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={Math.round(totalTimeMs / 1000)}
        aria-valuenow={Number(formatSeconds(timeLeftMs))}
        className="relative mt-4 h-5 overflow-hidden rounded-full bg-surface-container-highest"
      >
        {/*
          残り時間ぶんだけ左から伸びる帯。時間が減ると右端が左へ後退する。
          CSS トランジションは付けない。描画が間引かれている環境ではアニメーションの
          時計が進まず、幅が開始値のまま固まってしまうため。
          幅の更新自体が 50ms ごとに入るので、これで十分なめらかに動く。
        */}
        <div
          className={`h-full rounded-full ${indicator}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </section>
  );
}
