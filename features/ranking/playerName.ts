const NAME_KEY = "sps.playerName.v1";

/** 前回のプレイヤー名を復元する。 */
export function loadPlayerName(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

/** 次回のためにプレイヤー名を覚えておく。 */
export function savePlayerName(name: string) {
  try {
    window.localStorage.setItem(NAME_KEY, name);
  } catch {
    /* noop */
  }
}
