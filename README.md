# Simultaneous Press — 同時押しタイピングゲーム

表示された 3〜10 文字を **0.5 秒以内にまとめて押し切る**、60 秒間のスコアアタック。

- フロントエンド: TypeScript / Next.js (App Router) / Tailwind CSS
- アイコン: [Lucide](https://lucide.dev)（絵文字は不使用）
- スコア保存: Supabase（未設定時は localStorage にフォールバック）

## セットアップ

```bash
npm install
npm run dev
```

http://localhost:3000 を開く。

### Supabase を使う場合

1. `supabase/schema.sql` を Supabase の SQL Editor で実行する。
2. `.env.local.example` を `.env.local` にコピーし、URL と anon key を設定する。

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
```

環境変数が無い場合はブラウザの localStorage にスコアを保存するため、設定なしでも動作する。

## ゲームルール

| 項目 | 仕様 |
| --- | --- |
| モード | 3〜10 文字（開始前に選択） |
| 同時押し判定 | 最初の 1 キーを押してから **0.5 秒以内**に表示中の全キーを押し切れば成功 |
| ミス | 0.5 秒を超過、または対象外のキーを押した時点 |
| 制限時間 | 60 秒。ノーミス **3 問**連続ごとに **+1 秒**、**10 問**連続ごとに **+3 秒** |
| スコア | n 文字モードの成功で **100 × n 点** |
| 倍率 | 前の成功から **3 秒以内**に成功すると **×1.1**。連鎖する限り累乗で継続（×1.1 → ×1.21 → …） |
| コンボ | 3 秒以内の連続成功数。倍率と同じ連鎖をカウントして表示 |
| ランキング | プレイヤー名ごとに **TOP 5** を保存・表示。ランクインした行を NEW RECORD として差し替え表示 |

## ディレクトリ構成

機能（feature）ごとにロジックとコンポーネントをまとめてある。「スコアの計算式を変えたい」「保存先を変えたい」といった修正が 1 ディレクトリで完結する。

```
app/                          Next.js のルート（画面の組み立てとフェーズ遷移のみ）
features/
  game/                       同時押しの判定とゲームループ
    constants.ts              0.5 秒の判定ウィンドウ
    keys.ts                   お題の抽選・キーの正規化
    engine.ts                 判定ロジック本体（React 非依存）
    useGame.ts                engine を rAF で回し React state に同期する
    types.ts                  GameSnapshot / Flash
    components/               GameScreen, KeyboardTargets, Countdown
  scoring/                    スコアと倍率
    constants.ts              基礎点 100 / 倍率 1.1 / チェーン 3 秒
    scoring.ts                scoreFor, multiplierFor, isChained
    components/StatsBar.tsx
  timer/                      制限時間と時間ボーナス
    constants.ts              60 秒 / 3 問+1s / 10 問+3s
    timeBonus.ts              timeBonusFor, nextBonusIn
    components/TimerMeter.tsx
  ranking/                    スコアの保存とランキング
    types.ts                  ScoreEntry, ScoreStore
    supabaseScoreStore.ts     Supabase 実装
    localScoreStore.ts        localStorage 実装
    scoreRepository.ts        2 つを束ねる入口（画面はここだけ見る）
    playerName.ts             プレイヤー名の記憶
    components/               Leaderboard, ResultScreen
  setup/
    components/SetupScreen.tsx
shared/                       機能をまたぐもの（ModeSize, formatSeconds, Supabase クライアント）
```

### よくある修正の入口

| やりたいこと | 触るファイル |
| --- | --- |
| 基礎点・倍率・チェーン時間を変える | `features/scoring/constants.ts` |
| 制限時間・時間ボーナスの条件を変える | `features/timer/constants.ts` / `timeBonus.ts` |
| 同時押しの猶予（0.5 秒）を変える | `features/game/constants.ts` |
| 成功/ミスの判定ルールを変える | `features/game/engine.ts` |
| お題に使う文字を変える | `features/game/keys.ts` |
| 保存先を差し替える | `features/ranking/*ScoreStore.ts` |
| ランキングの表示件数を変える | `features/ranking/constants.ts` |

## 設計メモ

### ゲームループ

判定に関わる状態（残り時間・押下中のキー・コンボ・倍率）は `useRef` の単一エンジンオブジェクトに持ち、`requestAnimationFrame` で React state へ同期する（`features/game/engine.ts` と `features/game/useGame.ts`）。
これにより毎フレームの再レンダリングでも判定ロジックが stale closure の影響を受けない。

- 残り時間は「終了時刻（`performance.now()` 基準）」で保持するため、時間ボーナスの加算はその終了時刻を延ばすだけで済む。
- 0.5 秒ウィンドウの超過は rAF ループ側で監視し、キーを押し切らなくてもミス判定が入る。

### スコア計算

`features/scoring/scoring.ts` と `features/timer/timeBonus.ts` に純粋関数として切り出してある（`scoreFor` / `multiplierFor` / `timeBonusFor`）。判定を持つ `engine.ts` は React に依存しないため、そのまま単体テストできる。

### UI

Material Design 3 のカラーロール（surface / primary / secondary / tertiary / error のトーナルパレット）を `app/globals.css` の CSS 変数として定義し、Tailwind のカラーとして公開している。
カード類は M3 の filled card（surface-container 系の塗り + elevation）で構成し、border-left のアクセントカードは使用していない。ボタンのタップ領域・角丸・state layer は M3 / HIG のガイドラインに合わせてある。

## 既知の制約

一般的なメンブレンキーボードには**キーロールオーバーの上限**があり、同時に押せるキー数がハード的に 3〜6 個程度に制限される場合がある（キーボードゴースティング）。8〜10 文字モードを快適に遊ぶには NKRO 対応キーボードが必要。

## スクリプト

```bash
npm run dev        # 開発サーバー
npm run build      # 本番ビルド
npm run typecheck  # 型チェックのみ
```
