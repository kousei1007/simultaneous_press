# デプロイ手順 — Supabase + Vercel + 独自ドメイン

Simultaneous Press を Web ゲームとして公開するまでの手順。

- リポジトリ: https://github.com/kousei1007/simultaneous_press
- 検証状況: まっさらな環境で `npm ci && npm run build` が通ることを確認済み（Vercel と同じ手順）

---

## フェーズ1：Supabase（先にやる）

Vercel の設定にキーが必要になるため、Supabase を先に用意する。

### 1-1. プロジェクト作成

https://supabase.com でサインアップ → **New project**

| 項目 | 設定 |
| --- | --- |
| Name | `simultaneous-press` など任意 |
| Database Password | 強いものを生成して保管（DB直結時に必要。アプリでは使わない） |
| Region | `Northeast Asia (Tokyo)` |

作成完了まで 1〜2 分。

### 1-2. テーブルを作る

左メニュー **SQL Editor** → **New query** に `supabase/schema.sql` の中身を貼り付けて **Run**。

`Success. No rows returned` が出れば成功。**Table Editor** に `scores` テーブルが見えることを確認する。

### 1-3. キーを取得

**Project Settings → API** から次の2つを控える。

| 名前 | 用途 |
| --- | --- |
| Project URL（`https://xxxx.supabase.co`） | `NEXT_PUBLIC_SUPABASE_URL` |
| anon / public キー（`Publishable key` 表記の場合あり） | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

> **重要**: `service_role` キーは絶対に使わない。このアプリでは不要で、漏れると全データを操作される。

---

## フェーズ2：Vercel

### 2-1. リポジトリを取り込む

https://vercel.com に **GitHub アカウントでログイン**
→ **Add New… → Project** → `kousei1007/simultaneous_press` を **Import**

Framework は `Next.js` と自動判定される。Build Command などは変更不要。

### 2-2. 環境変数を「デプロイ前に」入れる

Import 画面の **Environment Variables** に2つ登録する。

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 1-3 の Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 1-3 の anon キー |

> **最重要**: `NEXT_PUBLIC_` で始まる変数は**ビルド時にコードへ埋め込まれる**。
> 後から追加しても再デプロイしない限り反映されない。必ず先に入れる。
>
> 入れ忘れた場合は Settings → Environment Variables に追加した後、
> **Deployments → 最新の「…」→ Redeploy** を実行する。

### 2-3. デプロイ

**Deploy** を押す。2〜3分で `https://simultaneous-press-xxxx.vercel.app` が発行される。

一度遊んでみて、スコアが Supabase の **Table Editor → scores** に入るか確認する。
入っていなければ環境変数の設定漏れ。

> 環境変数が無くてもアプリは localStorage にフォールバックして動くため、
> エラーが出ず気づきにくい。必ず Table Editor で確認すること。

---

## フェーズ3：ドメイン

### 3-1. 取得

| 取得先 | 特徴 |
| --- | --- |
| **Vercel Domains** | Vercel の管理画面から購入でき、DNS 設定が自動。いちばん簡単 |
| お名前.com / Xserver Domain | 国内。`.com` が年1,500円前後 |
| Cloudflare Registrar | 原価販売で安い。DNS 管理も優秀 |

`.com` `.app`、ゲームなら `.games` なども使える。

### 3-2. Vercel に登録

プロジェクトの **Settings → Domains → Add** にドメインを入力。

Vercel で購入した場合はここで完了。**外部で購入した場合のみ**、Vercel が表示する
DNS レコードを取得先の管理画面に登録する。

| レコード | 用途 |
| --- | --- |
| A レコード（`@` → Vercel が表示する IP） | ルートドメイン用 |
| CNAME（`www` → `cname.vercel-dns.com`） | www 用 |

> **必ず Vercel の画面に表示された値をコピーする。**
> 設定値は変わることがあるため、この表の値をそのまま使わないこと。

DNS の反映は数分〜最大48時間。反映されると Vercel 側の表示が
`Valid Configuration` に変わり、SSL 証明書も自動発行される。

---

## フェーズ4：仕上げ

### 4-1. 動作確認

独自ドメインで開き、**別のブラウザやスマホからもアクセス**して、
片方で出したスコアがもう片方のランキングに出るか確認する。
出れば Supabase 連携が正しく効いている。

### 4-2. 以降の更新

`git push` するだけで自動デプロイされる。

---

## 公開前に知っておくべきこと

### スコアが詐称できる状態

現在の RLS ポリシーは「誰でも insert 可能」。ブラウザの開発者ツールから
任意のプレイヤー名で好きなスコアを登録できる。改ざん・削除はできないが、
**ランキングの信頼性は保証されない**。

身内向けなら問題ないが、本格的に公開するなら Supabase Auth（匿名認証など）を
導入し、`player_name` をユーザー ID に紐付ける改修が必要。

### ユーザー名の重複

ユーザー名は端末ごとの localStorage に保存され、**サーバー側で一意性を検証していない**。
別の人が同じ名前を登録するとランキングが混ざる。

### 無料枠の制約

| サービス | 注意点 |
| --- | --- |
| Supabase Free | **1週間アクセスがないとプロジェクトが自動停止**する。停止後はダッシュボードから手動再開 |
| Vercel Hobby | **商用利用は規約違反**。広告を貼る・収益化する場合は Pro（月 $20）が必要 |

### 費用の目安

ドメイン代（年1,500円前後）のみ。Supabase と Vercel は無料枠で運用できる。

---

## トラブルシューティング

| 症状 | 原因と対処 |
| --- | --- |
| スコアが他の端末に共有されない | 環境変数の未設定、または設定後に再デプロイしていない。Redeploy する |
| ランキングが突然空になった | Supabase プロジェクトが自動停止している。ダッシュボードから再開 |
| ビルドが失敗する | Vercel の Deployments → 該当デプロイ → Building のログを確認 |
| ドメインが繋がらない | DNS 未反映。Vercel の Domains 画面で `Valid Configuration` になるまで待つ |
