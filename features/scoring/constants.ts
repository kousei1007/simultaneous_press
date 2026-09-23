/** この時間以内に次のお題を成功させるとスコア倍率が継続する(ミリ秒) */
export const CHAIN_WINDOW_MS = 3_000;

/** 倍率の刻み */
export const CHAIN_MULTIPLIER = 1.1;

/** 1 文字あたりの基礎点。n 文字モードの基礎点は BASE_POINT_PER_KEY × n。 */
export const BASE_POINT_PER_KEY = 100;
