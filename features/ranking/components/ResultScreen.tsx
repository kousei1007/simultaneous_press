"use client";

import { Flame, Home, Loader2, RotateCcw, Sparkles, Target } from "lucide-react";
import { Leaderboard } from "./Leaderboard";
import type { ModeSize } from "@/shared/types";
import type { ScoreEntry } from "../types";

type Props = {
  playerName: string;
  mode: ModeSize;
  score: number;
  maxCombo: number;
  successCount: number;
  missCount: number;
  topScores: ScoreEntry[];
  newRecordId: string | null;
  rank: number | null;
  saving: boolean;
  onRetry: () => void;
  onBackToSetup: () => void;
};

export function ResultScreen({
  playerName,
  mode,
  score,
  maxCombo,
  successCount,
  missCount,
  topScores,
  newRecordId,
  rank,
  saving,
  onRetry,
  onBackToSetup,
}: Props) {
  const isNewRecord = rank === 1;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 animate-fade-in-up">
      <section className="rounded-xl bg-surface-container-low p-8 text-center shadow-elev-2">
        <p className="text-sm font-medium tracking-widest text-on-surface-variant">
          TIME UP — {mode} 文字モード
        </p>

        {isNewRecord && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-on-primary shadow-elev-1">
            <Sparkles className="size-5" aria-hidden />
            <span className="font-semibold">NEW RECORD!</span>
          </div>
        )}

        <div className="mt-4 font-display text-6xl font-semibold tabular-nums text-tertiary sm:text-7xl">
          {score.toLocaleString()}
        </div>
        <p className="mt-1 text-on-surface-variant">
          {playerName}
          {rank ? ` ・ 自己ベスト ${rank} 位` : " ・ TOP 5 圏外"}
        </p>

        <div className="mx-auto mt-8 grid max-w-xl grid-cols-3 gap-3">
          <div className="rounded-lg bg-surface-container px-4 py-3">
            <div className="flex items-center justify-center gap-1.5 text-on-surface-variant">
              <Flame className="size-4" aria-hidden />
              <span className="text-xs tracking-wider">MAX COMBO</span>
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{maxCombo}</div>
          </div>
          <div className="rounded-lg bg-surface-container px-4 py-3">
            <div className="flex items-center justify-center gap-1.5 text-on-surface-variant">
              <Target className="size-4" aria-hidden />
              <span className="text-xs tracking-wider">SUCCESS</span>
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {successCount}
            </div>
          </div>
          <div className="rounded-lg bg-surface-container px-4 py-3">
            <div className="text-xs tracking-wider text-on-surface-variant">MISS</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{missCount}</div>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={onRetry}
            className="m3-state-layer inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-on-primary shadow-elev-1"
          >
            <RotateCcw className="size-5" aria-hidden />
            もう一度プレイ
          </button>
          <button
            onClick={onBackToSetup}
            className="m3-state-layer inline-flex items-center justify-center gap-2 rounded-full border border-outline px-8 py-4 font-medium text-on-surface"
          >
            <Home className="size-5" aria-hidden />
            モード選択に戻る
          </button>
        </div>

        {saving && (
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-on-surface-variant">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            スコアを保存しています…
          </p>
        )}
      </section>

      <Leaderboard
        entries={topScores}
        title={`${playerName} の TOP 5`}
        highlightId={newRecordId}
      />
    </div>
  );
}
