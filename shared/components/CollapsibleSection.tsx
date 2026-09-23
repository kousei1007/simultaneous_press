"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  title: string;
  icon?: React.ReactNode;
  /** 初期状態で開いておくか。 */
  defaultOpen?: boolean;
  children: React.ReactNode;
};

/** 見出しを押すと開閉するカード（M3 の filled card + expand 動作）。 */
export function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section className="overflow-hidden rounded-xl bg-surface-container-low shadow-elev-1">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((prev) => !prev)}
        className="m3-state-layer flex w-full items-center gap-3 px-6 py-4 text-left"
      >
        {icon}
        <span className="flex-1 font-display text-lg font-semibold text-on-surface">
          {title}
        </span>
        <ChevronDown
          className={`size-5 shrink-0 text-on-surface-variant transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {open && (
        <div id={contentId} className="animate-fade-in-up px-6 pb-6">
          {children}
        </div>
      )}
    </section>
  );
}
