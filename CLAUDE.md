# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # 開発サーバー (http://localhost:3000)
npm run build      # 本番ビルド
npm run typecheck  # 型チェックのみ (tsc --noEmit)
npm run lint       # next lint
```

テストフレームワークは導入されていない。検証は `npm run typecheck` と、開発サーバー上での実操作で行う。

**`next build` と `next dev` を同時に走らせないこと。** 両者が同じ `.next` を奪い合い、
Windows + OneDrive 環境では `EINVAL: readlink` や `__webpack_modules__ is not a function` で
dev サーバーが壊れる。復旧は「dev サーバーを停止 → `.next` を削除 → 再起動」の順。
dev サーバーが動いている状態で本番ビルドを検証したい場合は、別ディレクトリに clone して行う。

## アーキテクチャ

### 全体構造

機能（feature）単位でロジックとコンポーネントを同居させている。`app/` は画面の組み立てのみ。

```
app/page.tsx      フェーズ遷移の唯一の持ち主
features/game/    同時押し判定とゲームループ
features/scoring/ スコアと倍率
features/timer/   制限時間と時間ボーナス
features/ranking/ スコアの保存とランキング
features/setup/   登録画面・設定画面
shared/           機能をまたぐもの
```

### 状態の持ち方（最重要）

ゲームの可変状態は **React state ではなく `features/game/engine.ts` の `Engine`
オブジェクト**に持ち、`useRef` で保持する。`features/game/useGame.ts` はそれを
定期的に `toSnapshot()` して React state へ流し込むだけ。

この分離により、毎フレームの再レンダリングでも判定ロジックが stale closure の
影響を受けない。判定ルールを変えるときは `engine.ts` だけを触ればよく、
`engine.ts` は React に依存しないためそのまま単体テストできる。

`page.tsx` のフェーズ（`register → setup → ready → playing → result`）が画面遷移を
一元管理する。ゲーム終了の検知は `state.finished` を見る effect で行い、
**その時点の値を `finalResult` に確定コピーする**。結果画面はフックの state ではなく
このコピーを描画する（フックがリセットされても結果が消えないようにするため）。

### 時間の扱い（触る前に必ず読むこと）

残り時間は「終了時刻」（`engine.endsAt`, `performance.now()` 基準）で保持する。
時間ボーナスはこの終了時刻を後ろへずらすだけで表現できる。

**`requestAnimationFrame` だけに依存してはいけない。** タブが描画されていない環境では
rAF が 1 度も発火せず、時計ごと止まる。`useGame.ts` は rAF に加えて
`setInterval(TICK_MS = 50ms)` で同じ `tick()` を回している。どちらか一方を消すと
特定環境で残り時間が凍結する。

**タイマーバーの塗りに CSS トランジションを付けてはいけない。**
（`features/timer/components/TimerMeter.tsx`）
トランジションはアニメーション用の時計で進むため、描画が間引かれる環境では
`style.width` が正しく変化していても描画幅が開始値のまま固まる。
幅は 50ms ごとに更新されるので、トランジションなしで十分なめらかに動く。

### サーバー描画との整合（ハイドレーション）

ブラウザ固有の情報を読む処理は、必ず effect 内で行い、確定するまで描画を止める。

- `useIsPc()` … PC 判定。確定まで `null` を返す
- `page.tsx` の `initialized` … `localStorage` を読み終えるまで画面を出さない
- `FoliageBackground` … **`Math.random()` を使ってはいけない**。固定シードの
  mulberry32 で葉の配置を決めることで、サーバーとクライアントの出力を一致させている

### スコアの保存

`features/ranking/scoreRepository.ts` が唯一の入口。`supabaseScoreStore` を試し、
環境変数未設定または通信失敗なら `localScoreStore`（localStorage）に落ちる。
画面側はこの repository だけを見る。保存先を足すときは Store を実装して
repository に繋ぐ。

**`NEXT_PUBLIC_` の環境変数はビルド時にコードへ埋め込まれる。** デプロイ後に
追加しても再デプロイするまで反映されない。しかも未設定でも localStorage に
フォールバックしてエラーなく動くため、連携の失敗に気づきにくい。

### UI

Material Design 3 のトーナルパレットを `app/globals.css` の CSS 変数
（`--m3-*`）として定義し、`tailwind.config.ts` で Tailwind のカラーとして公開している。
色を変えるときは個別のコンポーネントではなく `globals.css` を触る。
見出しは `font-display`（Fraunces）、本文は `font-sans`（Inter）。

### デバイス制限

同時押しは物理キーボードが前提のため、PC 以外ではゲーム画面自体を描画しない
（`page.tsx` の早期リターン）。判定は UA と「主入力ポインタが coarse かつ hover 不可」の
2 系統。後者があるため、iPadOS Safari が Macintosh を名乗る場合も弾ける。
タッチ対応ノート PC を誤って弾かないよう、メディアクエリ側は 2 条件が揃ったときのみ非 PC とみなす。

## 仕様上の既知の制約

- `supabase/schema.sql` の RLS は誰でも `insert` 可能。改ざん・削除はできないが、
  任意のプレイヤー名で任意のスコアを登録できる（スコア詐称が可能）
- ユーザー名はサーバー側で一意性を検証していない。別の人が同じ名前を登録すると
  ランキングが混ざる
- 一般的なキーボードのキーロールオーバー上限により、8〜10 文字モードは
  NKRO 対応キーボードでないと押し切れないことがある
