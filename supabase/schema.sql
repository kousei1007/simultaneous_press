-- Supabase / Postgres schema for Simultaneous Press
-- Supabase ダッシュボードの SQL Editor に貼り付けて実行してください。

create table if not exists public.scores (
  id            uuid primary key default gen_random_uuid(),
  player_name   text        not null check (char_length(player_name) between 1 and 20),
  mode          smallint    not null check (mode between 3 and 10),
  score         integer     not null check (score >= 0),
  max_combo     integer     not null default 0 check (max_combo >= 0),
  success_count integer     not null default 0 check (success_count >= 0),
  miss_count    integer     not null default 0 check (miss_count >= 0),
  created_at    timestamptz not null default now()
);

-- プレイヤーごとの上位取得用
create index if not exists scores_player_score_idx
  on public.scores (player_name, score desc, created_at asc);

alter table public.scores enable row level security;

-- 匿名キーからの読み取りと追記のみ許可(更新・削除は不可)
drop policy if exists "scores are readable by everyone" on public.scores;
create policy "scores are readable by everyone"
  on public.scores for select
  to anon, authenticated
  using (true);

drop policy if exists "anyone can insert a score" on public.scores;
create policy "anyone can insert a score"
  on public.scores for insert
  to anon, authenticated
  with check (true);
