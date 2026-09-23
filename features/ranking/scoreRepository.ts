import { TOP_N } from "./constants";
import { localScoreStore, sortByRank } from "./localScoreStore";
import { supabaseScoreStore } from "./supabaseScoreStore";
import type { NewScore, ScoreEntry, SubmitResult } from "./types";

/**
 * スコアの読み書き口。Supabase が使えればそちら、だめなら localStorage を使う。
 * 画面側はこのモジュールだけを見ればよい。
 */

/** プレイヤー個人の上位 TOP_N 件を降順で取得する。 */
export async function fetchTopScores(playerName: string): Promise<ScoreEntry[]> {
  const remote = await supabaseScoreStore.fetchTop(playerName, TOP_N);
  if (remote) return remote;
  return localScoreStore.fetchTop(playerName, TOP_N);
}

/**
 * スコアを保存し、更新後のランキングと、そのスコアのランク(1 始まり/圏外は null)を返す。
 */
export async function submitScore(entry: NewScore): Promise<SubmitResult> {
  const remoteSaved = await supabaseScoreStore.insert(entry);

  if (remoteSaved) {
    const top = await fetchTopScores(entry.playerName);
    return {
      saved: remoteSaved,
      top,
      rank: rankOf(top, remoteSaved.id),
      persisted: "supabase",
    };
  }

  const saved = await localScoreStore.insert(entry);
  const top = await localScoreStore.fetchTop(entry.playerName, TOP_N);
  return { saved, top, rank: rankOf(top, saved.id), persisted: "local" };
}

function rankOf(top: ScoreEntry[], id: string): number | null {
  const index = top.findIndex((e) => e.id === id);
  return index >= 0 ? index + 1 : null;
}

export { TOP_N, sortByRank };
