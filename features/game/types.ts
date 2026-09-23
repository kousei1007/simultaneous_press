/** 成功/ミス時に画面へ出す一時的なフィードバック。 */
export type Flash = {
  id: number;
  kind: "success" | "miss";
  text: string;
  sub?: string;
};

/** 描画用に切り出したゲーム状態のスナップショット。 */
export type GameSnapshot = {
  running: boolean;
  finished: boolean;
  timeLeftMs: number;
  /** 制限時間の伸縮を含めた「今回の総持ち時間」。メーターの分母に使う。 */
  totalTimeMs: number;
  targets: string[];
  pressed: string[];
  /** 同時押し判定ウィンドウの残り割合 (0〜1)。押していないときは null。 */
  windowProgress: number | null;
  score: number;
  combo: number;
  maxCombo: number;
  multiplier: number;
  noMissStreak: number;
  successCount: number;
  missCount: number;
};

/** 1 問ぶんの判定結果。 */
export type SuccessOutcome = {
  /** 獲得した点数 */
  gained: number;
  /** 加算された時間(ミリ秒)。0 ならボーナスなし。 */
  bonusMs: number;
};
