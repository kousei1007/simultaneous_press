/** 画面のフェーズ。 */
export type Phase = "register" | "setup" | "ready" | "playing" | "result";

/** 同時押しする文字数(モード)。3〜10 文字。 */
export type ModeSize = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export const MODE_SIZES: ModeSize[] = [3, 4, 5, 6, 7, 8, 9, 10];
