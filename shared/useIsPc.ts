"use client";

import { useEffect, useState } from "react";

/**
 * PC（物理キーボードが前提の環境）かどうかを判定する。
 *
 * このゲームは複数キーの同時押しが前提のため、タッチデバイスでは成立しない。
 * 判定はブラウザの情報を見るためクライアントでのみ行う。
 * 判定が終わるまでは null を返す（サーバー描画との不一致を避けるため）。
 */
export function useIsPc(): boolean | null {
  const [isPc, setIsPc] = useState<boolean | null>(null);

  useEffect(() => {
    const mobileUa =
      /Android|iPhone|iPad|iPod|Windows Phone|Mobile|Tablet|Silk|Kindle/i.test(
        navigator.userAgent,
      );
    // 主入力がタッチ（coarse かつ hover 不可）なら PC ではないとみなす。
    // タッチ対応のノート PC を誤って弾かないよう、2 条件が揃ったときだけ判定する。
    const touchPrimary =
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(hover: hover)").matches;

    setIsPc(!mobileUa && !touchPrimary);
  }, []);

  return isPc;
}
