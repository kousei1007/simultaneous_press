"use client";

import {
  Crown,
  Keyboard,
  ListChecks,
  Play,
  Timer,
  TrendingUp,
  User,
} from "lucide-react";
import { MODE_SIZES, type ModeSize } from "@/shared/types";
import { basePointFor } from "@/features/scoring/scoring";
import { Leaderboard } from "@/features/ranking/components/Leaderboard";
import type { ScoreEntry } from "@/features/ranking/types";
import { CollapsibleSection } from "@/shared/components/CollapsibleSection";

type Props = {
  playerName: string;
  mode: ModeSize;
  onModeChange: (mode: ModeSize) => void;
  onStart: () => void;
  topScores: ScoreEntry[];
};

const RULES = [
  {
    icon: Keyboard,
    title: "同時押し判定",
    body: "最初の 1 キーを押してから 0.5 秒以内に、表示されている全キーを押し切れば成功。対象外のキーを押した時点でミス。",
  },
  {
    icon: Timer,
    title: "制限時間 60 秒",
    body: "ノーミスで 3 問連続ごとに +1 秒、10 問連続ごとに +3 秒を加算。",
  },
  {
    icon: TrendingUp,
    title: "スコアとコンボ",
    body: "n 文字モードの成功で 100 × n 点。前の成功から 3 秒以内に成功すると倍率が ×1.1 ずつ積み上がる。",
  },
];

export function SetupScreen({
  playerName,
  mode,
  onModeChange,
  onStart,
  topScores,
}: Props) {
  const canStart = playerName.trim().length > 0;

  return (
    <div className="mx-auto flex w-full max-w-xl animate-fade-in-up flex-col gap-4">
      <header className="pt-4">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-tertiary sm:text-5xl">
          Simultaneous Press
        </h1>
        <p className="mt-2 text-base text-on-surface-variant">
          表示された文字をまとめて同時に押す、60 秒間のタイピングゲーム。
        </p>
      </header>

      {/* プレイヤー（登録済みのため変更不可） */}
      <section className="rounded-xl bg-surface-container-low p-6 shadow-elev-1">
        <p className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
          <User className="size-4" aria-hidden />
          プレイヤー
        </p>
        <p className="mt-2 font-display text-2xl font-semibold text-on-surface">
          {playerName}
        </p>
        <p className="mt-2 text-xs text-on-surface-variant">
          ユーザー名は一度登録すると変更できません。
        </p>
      </section>

      {/* モード選択 */}
      <section className="rounded-xl bg-surface-container-low p-6 shadow-elev-1">
        <h2 className="text-sm font-medium text-on-surface-variant">
          モード（同時に押す文字数）
        </h2>
        <div
          role="radiogroup"
          aria-label="同時に押す文字数"
          className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8"
        >
          {MODE_SIZES.map((size) => {
            const selected = size === mode;
            return (
              <button
                key={size}
                role="radio"
                aria-checked={selected}
                onClick={() => onModeChange(size)}
                className={[
                  "m3-state-layer rounded-full py-3 text-lg font-semibold transition-colors",
                  selected
                    ? "bg-primary text-on-primary shadow-elev-1"
                    : "bg-surface-container-high text-on-surface-variant",
                ].join(" ")}
              >
                {size}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-on-surface-variant">
          選択中: <span className="font-semibold text-on-surface">{mode} 文字</span>
          モード（成功 1 回あたり基礎 {basePointFor(mode)} 点）
        </p>
      </section>

      <button
        onClick={onStart}
        disabled={!canStart}
        className="m3-state-layer flex items-center justify-center gap-3 rounded-full bg-primary px-8 py-5 text-xl font-semibold text-on-primary shadow-elev-2 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Play className="size-6" aria-hidden />
        ゲームを開始
      </button>
      {!canStart && (
        <p className="-mt-2 text-center text-sm text-error">
          プレイヤー名を入力してください。
        </p>
      )}

      {/* ランキング（押下で開閉） */}
      <CollapsibleSection
        title={`${playerName || "プレイヤー"} の TOP 5`}
        icon={<Crown className="size-5 shrink-0 text-tertiary" aria-hidden />}
        defaultOpen
      >
        <Leaderboard
          entries={topScores}
          title={`${playerName || "プレイヤー"} の TOP 5`}
          bare
        />
      </CollapsibleSection>

      {/* ルール（押下で開閉） */}
      <CollapsibleSection
        title="ルール"
        icon={<ListChecks className="size-5 shrink-0 text-tertiary" aria-hidden />}
      >
        <ul className="flex flex-col gap-5">
          {RULES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="font-medium text-on-surface">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CollapsibleSection>
    </div>
  );
}
