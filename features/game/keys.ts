import type { ModeSize } from "@/shared/types";

/** お題に使う文字。英字 26 文字。 */
const KEY_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * 直前のお題と完全に同じ組み合わせにならないように n 文字を抽選する。
 */
export function pickKeys(size: ModeSize, previous?: readonly string[]): string[] {
  const prevKey = previous ? [...previous].sort().join("") : null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const pool = [...KEY_POOL];
    // Fisher-Yates で先頭 size 個だけ確定させる
    for (let i = 0; i < size; i += 1) {
      const j = i + Math.floor(Math.random() * (pool.length - i));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const picked = pool.slice(0, size);
    if (prevKey === null || [...picked].sort().join("") !== prevKey) {
      return picked;
    }
  }
  return KEY_POOL.slice(0, size);
}

/** 押下イベントの key を判定用の 1 文字に正規化する。 */
export function normalizeKey(raw: string): string | null {
  if (raw.length !== 1) return null;
  const upper = raw.toUpperCase();
  return /^[A-Z]$/.test(upper) ? upper : null;
}
