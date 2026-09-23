import type { ModeSize } from "@/shared/types";
import { isChained, multiplierFor, scoreFor } from "@/features/scoring/scoring";
import { GAME_DURATION_MS } from "@/features/timer/constants";
import { timeBonusFor } from "@/features/timer/timeBonus";
import { PRESS_WINDOW_MS } from "./constants";
import { pickKeys } from "./keys";
import type { GameSnapshot, SuccessOutcome } from "./types";

/**
 * ゲームの可変状態。React の外（ref）に置き、判定はすべてこのオブジェクトを直接更新する。
 * 時間は `performance.now()` 基準のミリ秒。
 */
export type Engine = {
  running: boolean;
  /** 終了時刻。時間ボーナスはこの値を後ろにずらすだけで表現する。 */
  endsAt: number;
  totalTimeMs: number;
  targets: string[];
  pressed: Set<string>;
  /** 最初の 1 キーを押した時刻。未押下なら null。 */
  windowStartAt: number | null;
  lastSuccessAt: number | null;
  score: number;
  /** 3 秒以内の連鎖段数（0 なら等倍）。 */
  chain: number;
  combo: number;
  maxCombo: number;
  noMissStreak: number;
  successCount: number;
  missCount: number;
};

export function createEngine(mode: ModeSize): Engine {
  return {
    running: false,
    endsAt: 0,
    totalTimeMs: GAME_DURATION_MS,
    targets: pickKeys(mode),
    pressed: new Set<string>(),
    windowStartAt: null,
    lastSuccessAt: null,
    score: 0,
    chain: 0,
    combo: 0,
    maxCombo: 0,
    noMissStreak: 0,
    successCount: 0,
    missCount: 0,
  };
}

/** 計測を開始する。 */
export function startEngine(engine: Engine, now: number): void {
  engine.running = true;
  engine.endsAt = now + GAME_DURATION_MS;
}

/** 計測を止める。 */
export function stopEngine(engine: Engine): void {
  engine.running = false;
  engine.windowStartAt = null;
}

/** 次のお題を出す（押下状態と判定ウィンドウをリセット）。 */
export function loadNextQuestion(engine: Engine, mode: ModeSize): void {
  engine.targets = pickKeys(mode, engine.targets);
  engine.pressed = new Set();
  engine.windowStartAt = null;
}

/** 制限時間を使い切ったか。 */
export function isTimeUp(engine: Engine, now: number): boolean {
  return engine.running && now >= engine.endsAt;
}

/** 0.5 秒の同時押しウィンドウを超過したか。 */
export function isWindowExpired(engine: Engine, now: number): boolean {
  return (
    engine.windowStartAt !== null && now - engine.windowStartAt > PRESS_WINDOW_MS
  );
}

/** そのキーがお題に含まれるか。 */
export function isTargetKey(engine: Engine, key: string): boolean {
  return engine.targets.includes(key);
}

/**
 * キーを押下として記録する。すでに押されていれば false を返す。
 * 最初の 1 キーで判定ウィンドウを開始する。
 */
export function pressKey(engine: Engine, key: string, now: number): boolean {
  if (engine.pressed.has(key)) return false;
  if (engine.windowStartAt === null) engine.windowStartAt = now;
  engine.pressed.add(key);
  return true;
}

/** 表示中のキーをすべて押し切ったか。 */
export function isAllPressed(engine: Engine): boolean {
  return engine.pressed.size === engine.targets.length;
}

/** ミスを記録し、コンボ・倍率・ノーミス数をリセットして次のお題へ進む。 */
export function applyMiss(engine: Engine, mode: ModeSize): void {
  engine.missCount += 1;
  engine.chain = 0;
  engine.combo = 0;
  engine.noMissStreak = 0;
  engine.lastSuccessAt = null;
  loadNextQuestion(engine, mode);
}

/**
 * 成功を記録する。倍率の継続判定・加点・時間ボーナスを行い、次のお題へ進む。
 */
export function applySuccess(
  engine: Engine,
  mode: ModeSize,
  now: number,
): SuccessOutcome {
  // 直前の成功から 3 秒以内ならチェーン継続、そうでなければリセット
  engine.chain = isChained(engine.lastSuccessAt, now) ? engine.chain + 1 : 0;
  engine.combo = engine.chain + 1;
  engine.maxCombo = Math.max(engine.maxCombo, engine.combo);
  engine.lastSuccessAt = now;

  const gained = scoreFor(mode, engine.chain);
  engine.score += gained;
  engine.successCount += 1;
  engine.noMissStreak += 1;

  const bonusMs = timeBonusFor(engine.noMissStreak);
  if (bonusMs > 0) {
    engine.endsAt += bonusMs;
    engine.totalTimeMs += bonusMs;
  }

  loadNextQuestion(engine, mode);
  return { gained, bonusMs };
}

/** 描画用スナップショットを作る。`finished` は呼び出し側で合成する。 */
export function toSnapshot(engine: Engine, now: number): GameSnapshot {
  const timeLeftMs = engine.running ? Math.max(0, engine.endsAt - now) : 0;
  const windowProgress =
    engine.windowStartAt === null
      ? null
      : Math.max(0, 1 - (now - engine.windowStartAt) / PRESS_WINDOW_MS);

  return {
    running: engine.running,
    finished: false,
    timeLeftMs,
    totalTimeMs: engine.totalTimeMs,
    targets: engine.targets,
    pressed: [...engine.pressed],
    windowProgress,
    score: engine.score,
    combo: engine.combo,
    maxCombo: engine.maxCombo,
    multiplier: multiplierFor(engine.chain),
    noMissStreak: engine.noMissStreak,
    successCount: engine.successCount,
    missCount: engine.missCount,
  };
}
