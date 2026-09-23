import { Monitor } from "lucide-react";

/** PC 以外からアクセスされたときに表示する案内。ゲームは開始できない。 */
export function DeviceBlockScreen() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md animate-fade-in-up flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-surface-container-low px-8 py-12 text-center shadow-elev-3">
        <span className="flex size-16 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
          <Monitor className="size-8" aria-hidden />
        </span>
        <h1 className="font-display text-3xl font-semibold text-tertiary">
          PCでログインしてください
        </h1>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          このゲームは複数のキーを同時に押して遊ぶため、
          物理キーボードのある PC でのみプレイできます。
        </p>
        <p className="text-xs text-on-surface-variant">
          スマートフォン・タブレットではプレイできません。
        </p>
      </div>
    </div>
  );
}
