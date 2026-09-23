"use client";

import { Flame, Gauge, Target, Trophy } from "lucide-react";
import {
  STREAK_BONUS_LARGE,
  STREAK_BONUS_SMALL,
} from "@/features/timer/constants";
import { nextBonusIn } from "@/features/timer/timeBonus";

type Props = {
  score: number;
  combo: number;
  multiplier: number;
  noMissStreak: number;
  successCount: number;
  missCount: number;
};

function Tile({
  icon,
  label,
  value,
  accent = false,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
  hint?: string;
}) {
  return (
    <div
      className={[
        "rounded-lg px-4 py-3 shadow-elev-1",
        accent
          ? "bg-primary-container text-on-primary-container"
          : "bg-surface-container text-on-surface",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 opacity-80">
        {icon}
        <span className="text-xs font-medium tracking-wider">{label}</span>
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 text-xs opacity-70">{hint}</div>}
    </div>
  );
}

export function StatsBar({
  score,
  combo,
  multiplier,
  noMissStreak,
  successCount,
  missCount,
}: Props) {
  const toBonus = nextBonusIn(noMissStreak);
  const nextBonusLabel =
    (noMissStreak + toBonus) % STREAK_BONUS_LARGE === 0
      ? `あと${toBonus}問で +3s`
      : `あと${toBonus}問で +1s`;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Tile
        icon={<Trophy className="size-4" aria-hidden />}
        label="SCORE"
        value={score.toLocaleString()}
      />
      <Tile
        icon={<Flame className="size-4" aria-hidden />}
        label="COMBO"
        value={`${combo}`}
        accent={combo >= 2}
        hint={combo >= 2 ? "3秒以内で継続中" : "3秒以内の連続成功で加算"}
      />
      <Tile
        icon={<Gauge className="size-4" aria-hidden />}
        label="MULTIPLIER"
        value={`×${multiplier.toFixed(2)}`}
        accent={multiplier > 1}
      />
      <Tile
        icon={<Target className="size-4" aria-hidden />}
        label="NO MISS"
        value={`${noMissStreak}`}
        hint={nextBonusLabel}
      />
      <div className="col-span-2 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-surface-container-low px-4 py-2 text-sm text-on-surface-variant sm:col-span-4">
        <span>
          成功 <span className="font-semibold text-on-surface">{successCount}</span> ／
          ミス <span className="font-semibold text-on-surface">{missCount}</span>
        </span>
        <span className="opacity-80">
          時間ボーナス: ノーミス {STREAK_BONUS_SMALL} 問ごとに +1s、
          {STREAK_BONUS_LARGE} 問ごとに +3s
        </span>
      </div>
    </div>
  );
}
