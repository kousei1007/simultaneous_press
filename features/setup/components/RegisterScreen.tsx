"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

type Props = {
  onRegister: (name: string) => void;
  storageLabel: string;
};

/** 初回のみ表示するユーザー名の登録画面。登録後は変更できない。 */
export function RegisterScreen({ onRegister, storageLabel }: Props) {
  const [name, setName] = useState("");
  const trimmed = name.trim();
  const canRegister = trimmed.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-md animate-fade-in-up flex-col gap-4 pt-10">
      <header>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-tertiary">
          ようこそ
        </h1>
        <p className="mt-2 text-base text-on-surface-variant">
          はじめにユーザー名を登録してください。
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canRegister) onRegister(trimmed);
        }}
        className="rounded-xl bg-surface-container-low p-6 shadow-elev-1"
      >
        <label
          htmlFor="register-name"
          className="flex items-center gap-2 text-sm font-medium text-on-surface-variant"
        >
          <UserPlus className="size-4" aria-hidden />
          ユーザー名
        </label>
        <input
          id="register-name"
          value={name}
          maxLength={20}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          placeholder="名前を入力"
          className="mt-3 w-full rounded-sm border border-outline bg-transparent px-4 py-3 text-lg text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none"
        />
        <p className="mt-2 text-xs text-on-surface-variant">
          スコアはこの名前ごとに保存されます（{storageLabel}）。
          <span className="font-medium text-on-surface">
            　登録後は変更できません。
          </span>
        </p>

        <button
          type="submit"
          disabled={!canRegister}
          className="m3-state-layer mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-on-primary shadow-elev-2 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          この名前で登録する
        </button>
      </form>
    </div>
  );
}
