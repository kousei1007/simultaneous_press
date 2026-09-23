import { getSupabase } from "@/shared/supabase";
import type { ModeSize } from "@/shared/types";
import type { NewScore, ScoreEntry } from "./types";

/** scores テーブルの行。 */
type ScoreRow = {
  id: string;
  player_name: string;
  mode: number;
  score: number;
  max_combo: number;
  success_count: number;
  miss_count: number;
  created_at: string;
};

function fromRow(row: ScoreRow): ScoreEntry {
  return {
    id: row.id,
    playerName: row.player_name,
    mode: row.mode as ModeSize,
    score: row.score,
    maxCombo: row.max_combo,
    successCount: row.success_count,
    missCount: row.miss_count,
    createdAt: row.created_at,
  };
}

/**
 * Supabase 上の保存先。環境変数が未設定、または通信に失敗した場合は null を返し、
 * 呼び出し側（scoreRepository）が localStorage にフォールバックする。
 */
export const supabaseScoreStore = {
  async fetchTop(playerName: string, limit: number): Promise<ScoreEntry[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("player_name", playerName)
      .order("score", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error || !data) return null;
    return (data as ScoreRow[]).map(fromRow);
  },

  async insert(entry: NewScore): Promise<ScoreEntry | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("scores")
      .insert({
        player_name: entry.playerName,
        mode: entry.mode,
        score: entry.score,
        max_combo: entry.maxCombo,
        success_count: entry.successCount,
        miss_count: entry.missCount,
      })
      .select()
      .single();

    if (error || !data) return null;
    return fromRow(data as ScoreRow);
  },
};
