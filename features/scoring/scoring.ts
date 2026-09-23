import type { ModeSize } from "@/shared/types";
import { BASE_POINT_PER_KEY, CHAIN_MULTIPLIER, CHAIN_WINDOW_MS } from "./constants";

/** チェーン段数 n から倍率を求める(n = 0 なら等倍)。 */
export function multiplierFor(chain: number): number {
  return CHAIN_MULTIPLIER ** chain;
}

/**
 * 1 問ぶんの獲得点。n 文字モードの基礎点 100n に倍率を掛けて四捨五入する。
 */
export function scoreFor(mode: ModeSize, chain: number): number {
  return Math.round(BASE_POINT_PER_KEY * mode * multiplierFor(chain));
}

/** n 文字モードの基礎点(倍率なし)。 */
export function basePointFor(mode: ModeSize): number {
  return BASE_POINT_PER_KEY * mode;
}

/**
 * 直前の成功から続けてチェーンが繋がるか(3 秒以内か)を判定する。
 */
export function isChained(lastSuccessAt: number | null, now: number): boolean {
  return lastSuccessAt !== null && now - lastSuccessAt <= CHAIN_WINDOW_MS;
}
