"use client";

import { Check } from "lucide-react";

type Props = {
  targets: string[];
  pressed: string[];
  /** 判定ウィンドウの残り割合 (0〜1)。押下前は null。 */
  windowProgress: number | null;
  shakeKey: number;
};

/** お題キーのチップ群。押されたものは filled、未押下は outlined で表す。 */
export function KeyboardTargets({ targets, pressed, windowProgress, shakeKey }: Props) {
  const pressedSet = new Set(pressed);

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        key={shakeKey}
        className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
      >
        {targets.map((key) => {
          const isPressed = pressedSet.has(key);
          return (
            <div
              key={key}
              className={[
                "relative flex size-16 items-center justify-center rounded-lg border-2 text-3xl font-semibold tabular-nums transition-colors duration-100 sm:size-20 sm:text-4xl",
                isPressed
                  ? "animate-key-pop border-primary bg-primary text-on-primary shadow-elev-2"
                  : "border-outline-variant bg-surface-container text-on-surface",
              ].join(" ")}
            >
              {key}
              {isPressed && (
                <Check
                  className="absolute right-1 top-1 size-4 text-on-primary/80"
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 0.5 秒の同時押しウィンドウ */}
      <div className="h-6 w-full max-w-md">
        {windowProgress !== null && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium tracking-widest text-on-surface-variant">
              0.5s
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-highest">
              <div
                className="h-full rounded-full bg-tertiary"
                style={{ width: `${windowProgress * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
