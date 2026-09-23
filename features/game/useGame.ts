"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ModeSize } from "@/shared/types";
import {
  applyMiss,
  applySuccess,
  createEngine,
  isAllPressed,
  isTargetKey,
  isTimeUp,
  isWindowExpired,
  pressKey,
  startEngine,
  stopEngine,
  toSnapshot,
  type Engine,
} from "./engine";
import { normalizeKey } from "./keys";
import type { Flash, GameSnapshot } from "./types";

/** rAF が止まっている環境でも残り時間を進めるためのタイマー間隔(ミリ秒)。 */
const TICK_MS = 50;

/**
 * ゲームループとキー入力の配線。判定そのものは engine.ts に委譲し、
 * ここは「rAF で回す」「React state に同期する」「フィードバックを出す」だけを持つ。
 */
export function useGame(mode: ModeSize) {
  const engineRef = useRef<Engine>(createEngine(mode));
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const flashIdRef = useRef(0);

  const [state, setState] = useState<GameSnapshot>(() =>
    toSnapshot(engineRef.current, 0),
  );
  const [flash, setFlash] = useState<Flash | null>(null);
  const [finished, setFinished] = useState(false);

  const sync = useCallback((now: number) => {
    setState(toSnapshot(engineRef.current, now));
  }, []);

  /** モードを変えたら盤面を作り直す(プレイ中は無視)。 */
  useEffect(() => {
    if (engineRef.current.running) return;
    engineRef.current = createEngine(mode);
    setFinished(false);
    setFlash(null);
    sync(performance.now());
  }, [mode, sync]);

  const pushFlash = useCallback(
    (kind: Flash["kind"], text: string, sub?: string) => {
      flashIdRef.current += 1;
      setFlash({ id: flashIdRef.current, kind, text, sub });
    },
    [],
  );

  const registerMiss = useCallback(
    (reason: string) => {
      applyMiss(engineRef.current, mode);
      pushFlash("miss", "MISS", reason);
    },
    [mode, pushFlash],
  );

  const registerSuccess = useCallback(
    (now: number) => {
      const { gained, bonusMs } = applySuccess(engineRef.current, mode, now);
      pushFlash(
        "success",
        `+${gained}`,
        bonusMs > 0 ? `TIME +${bonusMs / 1000}s` : undefined,
      );
    },
    [mode, pushFlash],
  );

  const stop = useCallback(() => {
    stopEngine(engineRef.current);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setFinished(true);
    sync(performance.now());
  }, [sync]);

  const stopRef = useRef(stop);
  stopRef.current = stop;
  const registerMissRef = useRef(registerMiss);
  registerMissRef.current = registerMiss;

  /** 1 回ぶんの時間進行。時間切れ・ウィンドウ超過を見て画面へ同期する。 */
  const tick = useCallback(() => {
    const now = performance.now();
    const engine = engineRef.current;
    if (!engine.running) return;

    if (isTimeUp(engine, now)) {
      stopRef.current();
      return;
    }
    // 同時押しウィンドウ超過
    if (isWindowExpired(engine, now)) {
      registerMissRef.current("0.5秒を超えました");
    }

    sync(now);
  }, [sync]);

  const tickRef = useRef(tick);
  tickRef.current = tick;

  const loop = useCallback(() => {
    tickRef.current();
    if (engineRef.current.running) {
      rafRef.current = requestAnimationFrame(loop);
    }
  }, []);

  const start = useCallback(() => {
    const now = performance.now();
    const engine = createEngine(mode);
    startEngine(engine, now);
    engineRef.current = engine;
    setFinished(false);
    setFlash(null);
    sync(now);

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);

    // requestAnimationFrame はタブが描画されていないと 1 度も呼ばれないことがある。
    // 残り時間が止まらないよう、タイマーでも同じ tick を回す。
    if (timerRef.current !== null) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => tickRef.current(), TICK_MS);
  }, [loop, mode, sync]);

  /** キー入力 */
  useEffect(() => {
    function onKeyDown(ev: KeyboardEvent) {
      const engine = engineRef.current;
      if (!engine.running) return;
      if (ev.repeat || ev.metaKey || ev.ctrlKey || ev.altKey) return;

      const key = normalizeKey(ev.key);
      if (!key) return;
      ev.preventDefault();

      if (engine.pressed.has(key)) return;

      if (!isTargetKey(engine, key)) {
        registerMiss(`${key} は対象外のキーです`);
        sync(performance.now());
        return;
      }

      const now = performance.now();
      pressKey(engine, key, now);

      if (isAllPressed(engine)) {
        if (!isWindowExpired(engine, now)) {
          registerSuccess(now);
        } else {
          registerMiss("0.5秒を超えました");
        }
      }
      sync(now);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [registerMiss, registerSuccess, sync]);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (timerRef.current !== null) clearInterval(timerRef.current);
    },
    [],
  );

  return { state: { ...state, finished }, flash, start, stop };
}
