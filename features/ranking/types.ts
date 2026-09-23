import type { ModeSize } from "@/shared/types";

export type ScoreEntry = {
  id: string;
  playerName: string;
  mode: ModeSize;
  score: number;
  maxCombo: number;
  successCount: number;
  missCount: number;
  createdAt: string;
};

export type NewScore = Omit<ScoreEntry, "id" | "createdAt">;

/** 保存結果。ランキング入りしなかった場合 rank は null。 */
export type SubmitResult = {
  saved: ScoreEntry;
  top: ScoreEntry[];
  rank: number | null;
  persisted: "supabase" | "local";
};

/** 保存先の共通インターフェース。 */
export type ScoreStore = {
  fetchTop: (playerName: string, limit: number) => Promise<ScoreEntry[]>;
  insert: (entry: NewScore) => Promise<ScoreEntry>;
};
