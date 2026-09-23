"use client";

import { Crown, Medal, Sparkles } from "lucide-react";
import type { ScoreEntry } from "../types";
import { TOP_N } from "../constants";

type Props = {
  entries: ScoreEntry[];
  title: string;
  /** NEW RECORD としてハイライトする行の id */
  highlightId?: string | null;
  /** 開閉カードの中に置くときは true。カードの枠と見出しを省く。 */
  bare?: boolean;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function Leaderboard({
  entries,
  title,
  highlightId = null,
  bare = false,
}: Props) {
  const rows = Array.from({ length: TOP_N }, (_, i) => entries[i] ?? null);

  return (
    <section
      className={bare ? "" : "rounded-xl bg-surface-container-low p-6 shadow-elev-1"}
    >
      {!bare && (
        <div className="flex items-center gap-2">
          <Crown className="size-5 text-tertiary" aria-hidden />
          <h2 className="font-display text-lg font-semibold text-on-surface">
            {title}
          </h2>
        </div>
      )}

      <ol className={`flex flex-col gap-2 ${bare ? "" : "mt-4"}`}>
        {rows.map((entry, index) => {
          const rank = index + 1;
          const isNew = entry !== null && entry.id === highlightId;

          if (!entry) {
            return (
              <li
                key={`empty-${rank}`}
                className="flex items-center gap-3 rounded-md bg-surface-container px-4 py-3 text-on-surface-variant/50"
              >
                <span className="w-6 text-center text-sm font-semibold tabular-nums">
                  {rank}
                </span>
                <span className="text-sm">記録なし</span>
              </li>
            );
          }

          return (
            <li
              key={entry.id}
              className={[
                "flex items-center gap-3 rounded-md px-4 py-3 transition-colors",
                isNew
                  ? "bg-primary-container text-on-primary-container shadow-elev-1"
                  : "bg-surface-container text-on-surface",
              ].join(" ")}
            >
              <span className="flex w-6 justify-center">
                {rank === 1 ? (
                  <Medal className="size-5 text-tertiary" aria-hidden />
                ) : (
                  <span className="text-sm font-semibold tabular-nums">{rank}</span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-semibold tabular-nums">
                    {entry.score.toLocaleString()}
                  </span>
                  <span className="text-xs opacity-70">{entry.mode}文字</span>
                  {isNew && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-on-primary">
                      <Sparkles className="size-3" aria-hidden />
                      NEW RECORD
                    </span>
                  )}
                </div>
                <div className="mt-0.5 truncate text-xs opacity-70">
                  最大コンボ {entry.maxCombo} ／ 成功 {entry.successCount} ／{" "}
                  {formatDate(entry.createdAt)}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
