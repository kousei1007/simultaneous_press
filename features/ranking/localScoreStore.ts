import type { NewScore, ScoreEntry } from "./types";

const LOCAL_KEY = "sps.scores.v1";

function readAll(): ScoreEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as ScoreEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAll(entries: ScoreEntry[]) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(entries));
  } catch {
    /* クォータ超過などは無視する */
  }
}

/** スコアの高い順（同点なら先に出したほうが上）に並べる。 */
export function sortByRank(entries: ScoreEntry[]): ScoreEntry[] {
  return [...entries].sort(
    (a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt),
  );
}

/** Supabase を使わないときの保存先(この端末の localStorage)。 */
export const localScoreStore = {
  async fetchTop(playerName: string, limit: number): Promise<ScoreEntry[]> {
    return sortByRank(readAll().filter((e) => e.playerName === playerName)).slice(
      0,
      limit,
    );
  },

  async insert(entry: NewScore): Promise<ScoreEntry> {
    const saved: ScoreEntry = {
      ...entry,
      id:
        globalThis.crypto?.randomUUID?.() ??
        `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
    };
    writeAll([...readAll(), saved]);
    return saved;
  },
};
