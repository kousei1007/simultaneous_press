import {
  STREAK_BONUS_LARGE,
  STREAK_BONUS_LARGE_MS,
  STREAK_BONUS_SMALL,
  STREAK_BONUS_SMALL_MS,
} from "./constants";

/**
 * ノーミス連続数に応じた時間ボーナス(ミリ秒)。
 * 10 の倍数のときは +3 秒、それ以外の 3 の倍数のときは +1 秒。
 */
export function timeBonusFor(noMissStreak: number): number {
  if (noMissStreak > 0 && noMissStreak % STREAK_BONUS_LARGE === 0) {
    return STREAK_BONUS_LARGE_MS;
  }
  if (noMissStreak > 0 && noMissStreak % STREAK_BONUS_SMALL === 0) {
    return STREAK_BONUS_SMALL_MS;
  }
  return 0;
}

/** 次の時間ボーナスまであと何問か。 */
export function nextBonusIn(noMissStreak: number): number {
  const toSmall = STREAK_BONUS_SMALL - (noMissStreak % STREAK_BONUS_SMALL);
  const toLarge = STREAK_BONUS_LARGE - (noMissStreak % STREAK_BONUS_LARGE);
  return Math.min(toSmall, toLarge);
}
