-- AdoptLuck Supabase schema
-- Run this once in Supabase SQL Editor.
-- This project uses its own Roblox verification flow rather than Supabase Auth,
-- so the policies below intentionally permit the public anon key to read/write
-- application rows. For a production-money system, move writes behind a trusted
-- server/Edge Function and tighten these policies.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id text primary key,
  roblox_id bigint unique not null,
  username text not null,
  display_name text,
  avatar text,
  balance numeric not null default 0,
  level integer not null default 1,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  last_login_at timestamptz not null default now()
);

create table if not exists public.player_pets (
  id text primary key,
  username text not null,
  pet_id text not null,
  name text not null,
  image_url text not null,
  value_in_robux numeric not null default 0,
  rarity text,
  assigned_at bigint not null
);
create index if not exists player_pets_username_idx on public.player_pets(lower(username));

create table if not exists public.coinflip_games (
  id text primary key,
  creator_id text not null,
  challenger_id text,
  creator jsonb not null,
  challenger jsonb,
  creator_side text not null check (creator_side in ('heads','tails')),
  bet_amount numeric not null default 0,
  bet_type text not null default 'currency' check (bet_type in ('currency','pets')),
  creator_pets jsonb,
  challenger_pets jsonb,
  status text not null default 'waiting' check (status in ('waiting','active','completed')),
  created_at bigint not null,
  winner jsonb,
  winning_side text,
  server_seed_hash text,
  server_seed text,
  client_seed text,
  is_bot_match boolean not null default false
);
create index if not exists coinflip_games_status_idx on public.coinflip_games(status, created_at desc);

create table if not exists public.user_wagers (
  username text primary key,
  roblox_id bigint,
  avatar text,
  wagered numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.pet_values (
  id text primary key,
  name text not null,
  image_url text not null,
  value_in_robux numeric not null default 0,
  rarity text,
  added_at bigint not null,
  added_by text
);

alter table public.profiles enable row level security;
alter table public.player_pets enable row level security;
alter table public.coinflip_games enable row level security;
alter table public.user_wagers enable row level security;
alter table public.pet_values enable row level security;

do $$
declare t text; begin
  foreach t in array array['profiles','player_pets','coinflip_games','user_wagers','pet_values'] loop
    execute format('drop policy if exists "public read %s" on public.%I', t, t);
    execute format('drop policy if exists "public insert %s" on public.%I', t, t);
    execute format('drop policy if exists "public update %s" on public.%I', t, t);
    execute format('drop policy if exists "public delete %s" on public.%I', t, t);
    execute format('create policy "public read %s" on public.%I for select using (true)', t, t);
    execute format('create policy "public insert %s" on public.%I for insert with check (true)', t, t);
    execute format('create policy "public update %s" on public.%I for update using (true) with check (true)', t, t);
    execute format('create policy "public delete %s" on public.%I for delete using (true)', t, t);
  end loop;
end $$;
