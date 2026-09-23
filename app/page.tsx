"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SetupScreen } from "@/features/setup/components/SetupScreen";
import { RegisterScreen } from "@/features/setup/components/RegisterScreen";
import { GameScreen } from "@/features/game/components/GameScreen";
import { Countdown } from "@/features/game/components/Countdown";
import { useGame } from "@/features/game/useGame";
import { ResultScreen } from "@/features/ranking/components/ResultScreen";
import { fetchTopScores, submitScore } from "@/features/ranking/scoreRepository";
import { loadPlayerName, savePlayerName } from "@/features/ranking/playerName";
import type { ScoreEntry } from "@/features/ranking/types";
import { isSupabaseConfigured } from "@/shared/supabase";
import { useIsPc } from "@/shared/useIsPc";
import { DeviceBlockScreen } from "@/shared/components/DeviceBlockScreen";
import type { ModeSize, Phase } from "@/shared/types";

type FinalResult = {
  mode: ModeSize;
  score: number;
  maxCombo: number;
  successCount: number;
  missCount: number;
};

export default function Page() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [mode, setMode] = useState<ModeSize>(4);
  const [playerName, setPlayerName] = useState("");
  const [topScores, setTopScores] = useState<ScoreEntry[]>([]);
  const [newRecordId, setNewRecordId] = useState<string | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);
  /** localStorage を読むまでは画面を出さない（登録画面のちらつき防止）。 */
  const [initialized, setInitialized] = useState(false);

  const { state, flash, start, stop } = useGame(mode);
  const submittedRef = useRef(false);
  const isPc = useIsPc();

  /* 初期化: 登録済みなら復元、未登録なら登録画面へ */
  useEffect(() => {
    const saved = loadPlayerName();
    setPlayerName(saved);
    setPhase(saved ? "setup" : "register");
    setInitialized(true);
  }, []);

  /* プレイヤー名が決まったらランキングを読み込む */
  useEffect(() => {
    const name = playerName.trim();
    if (!name) {
      setTopScores([]);
      return;
    }
    let cancelled = false;
    fetchTopScores(name).then((rows) => {
      if (!cancelled) setTopScores(rows);
    });
    return () => {
      cancelled = true;
    };
    // 結果保存後のランキングは submitScore の戻り値で更新するため phase は依存に含めない
  }, [playerName]);

  /* ゲーム終了を検知してスコアを保存 */
  useEffect(() => {
    if (phase !== "playing" || !state.finished || submittedRef.current) return;
    submittedRef.current = true;
    setSaving(true);
    setPhase("result");

    // プレイ中の値はここで確定させる(以降フックの状態に依存しない)
    const result: FinalResult = {
      mode,
      score: state.score,
      maxCombo: state.maxCombo,
      successCount: state.successCount,
      missCount: state.missCount,
    };
    setFinalResult(result);

    submitScore({ playerName: playerName.trim(), ...result })
      .then(({ saved, top, rank: newRank }) => {
        setTopScores(top);
        setNewRecordId(newRank !== null ? saved.id : null);
        setRank(newRank);
      })
      .finally(() => setSaving(false));
  }, [phase, state, playerName, mode]);

  const handleRegister = useCallback((name: string) => {
    savePlayerName(name);
    setPlayerName(name);
    setPhase("setup");
  }, []);

  const beginCountdown = useCallback(() => {
    const name = playerName.trim();
    if (!name) return;
    submittedRef.current = false;
    setNewRecordId(null);
    setRank(null);
    setPhase("ready");
  }, [playerName]);

  const handleCountdownDone = useCallback(() => {
    setPhase("playing");
    start();
  }, [start]);

  const handleQuit = useCallback(() => {
    stop();
  }, [stop]);

  // PC 以外からはプレイさせない（同時押しが成立しないため）
  if (isPc === false) {
    return (
      <main className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <DeviceBlockScreen />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
      {initialized && phase === "register" && (
        <RegisterScreen
          onRegister={handleRegister}
          storageLabel={isSupabaseConfigured ? "Supabase に保存" : "この端末に保存"}
        />
      )}

      {initialized && phase === "setup" && (
        <SetupScreen
          playerName={playerName}
          mode={mode}
          onModeChange={setMode}
          onStart={beginCountdown}
          topScores={topScores}
        />
      )}

      {phase === "ready" && <Countdown onDone={handleCountdownDone} />}

      {phase === "playing" && (
        <GameScreen mode={mode} state={state} flash={flash} onQuit={handleQuit} />
      )}

      {phase === "result" && finalResult && (
        <ResultScreen
          playerName={playerName.trim()}
          mode={finalResult.mode}
          score={finalResult.score}
          maxCombo={finalResult.maxCombo}
          successCount={finalResult.successCount}
          missCount={finalResult.missCount}
          topScores={topScores}
          newRecordId={newRecordId}
          rank={rank}
          saving={saving}
          onRetry={beginCountdown}
          onBackToSetup={() => setPhase("setup")}
        />
      )}
    </main>
  );
}
