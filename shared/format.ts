/** ミリ秒を「秒（小数第 1 位）」の文字列にする。 */
export function formatSeconds(ms: number): string {
  const clamped = Math.max(0, ms);
  return (clamped / 1000).toFixed(1);
}
