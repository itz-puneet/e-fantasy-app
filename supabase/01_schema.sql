-- ============================================================================
--  E-FANTASY  ::  01_schema.sql   (tables · security · signup bonus)
-- ============================================================================
--  RUN ORDER:  01_schema.sql  ->  02_functions.sql  ->  03_seed.sql
--  Paste into Supabase -> SQL Editor -> New query -> Run.
--
--  This is the FINAL, consolidated schema (it replaces the old schema.sql +
--  phase2..phase8 files). It is IDEMPOTENT: safe to run on a brand-new project
--  OR on an existing one — it only creates what's missing and reconciles the
--  handful of things that changed over time.
-- ============================================================================

create extension if not exists pgcrypto;   -- for gen_random_uuid()

-- ----------------------------------------------------------------------------
--  TABLES
-- ----------------------------------------------------------------------------

-- Users (extends Supabase auth.users)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text unique not null,
  phone      text unique,
  username   text,
  is_admin   boolean not null default false,   -- only admins may use the dashboard
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Virtual token balance (1 per user)
create table if not exists public.wallets (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  balance    integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

-- Wallet history (+credit / -debit)
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  amount      integer not null,                 -- + = credit, - = debit
  type        text not null,                    -- 'credit' | 'debit'
  description text,
  created_at  timestamptz not null default now()
);
create index if not exists transactions_user_created_idx
  on public.transactions (user_id, created_at desc);

-- Esports teams (Godlike, Soul, ...)
create table if not exists public.esports_teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  game       text not null default 'BGMI',
  logo_url   text,
  created_at timestamptz not null default now()
);

-- Pro players
create table if not exists public.players (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  team_id    uuid references public.esports_teams(id) on delete set null,
  game       text not null default 'BGMI',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Matches (status: upcoming | live | completed)
create table if not exists public.matches (
  id           uuid primary key default gen_random_uuid(),
  game         text not null default 'BGMI',
  title        text not null,
  map_name     text,
  start_time   timestamptz not null,
  status       text not null default 'upcoming',
  entry_cost   integer not null default 0,
  completed_at timestamptz,                      -- stamped when finalized; drives auto-cleanup
  created_at   timestamptz not null default now()
);
alter table public.matches add column if not exists completed_at timestamptz;
create index if not exists matches_game_start_idx on public.matches (game, start_time desc);

-- What each player actually did in a match (admin enters this)
create table if not exists public.match_player_stats (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid not null references public.matches(id) on delete cascade,
  player_id   uuid not null references public.players(id) on delete cascade,
  kills       integer not null default 0,
  knocks      integer not null default 0,
  self_knocks integer not null default 0,
  unique (match_id, player_id)
);

-- Rosters = the user's teams. MANY teams per user per match are allowed.
create table if not exists public.rosters (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  match_id     uuid not null references public.matches(id) on delete cascade,
  team_id      uuid references public.esports_teams(id),
  name         text,                             -- optional label ("Team 1", ...)
  tokens_spent integer not null default 0,
  total_points numeric not null default 0,
  created_at   timestamptz not null default now()
);
alter table public.rosters add column if not exists name text;
-- Remove the old "one team per match" rule if an earlier version created it.
alter table public.rosters drop constraint if exists rosters_user_id_match_id_key;

-- The 12 players inside a roster (+ captain / vice-captain flags)
create table if not exists public.roster_players (
  id              uuid primary key default gen_random_uuid(),
  roster_id       uuid not null references public.rosters(id) on delete cascade,
  player_id       uuid not null references public.players(id) on delete cascade,
  is_captain      boolean not null default false,
  is_vice_captain boolean not null default false,
  unique (roster_id, player_id)
);

-- Contests inside a match
create table if not exists public.tournaments (
  id                   uuid primary key default gen_random_uuid(),
  match_id             uuid not null references public.matches(id) on delete cascade,
  name                 text not null,
  entry_fee            integer not null default 0 check (entry_fee >= 0),
  prize_pool           integer not null default 0,
  max_entries          integer,                  -- NULL = unlimited total spots
  max_entries_per_user integer,                  -- NULL = unlimited teams per user
  current_entries      integer not null default 0,
  settled              boolean not null default false,   -- prevents double payout
  created_at           timestamptz not null default now()
);
alter table public.tournaments add column if not exists max_entries_per_user integer;
alter table public.tournaments add column if not exists settled boolean not null default false;
create index if not exists tournaments_match_idx on public.tournaments (match_id);
-- Prize pool = total entry fees collected (it grows on each join). Reconcile any
-- rows created under the old "admin sets a fixed pool" model to match this rule.
update public.tournaments set prize_pool = entry_fee * current_entries
where prize_pool <> entry_fee * current_entries;

-- Join records. One entry per TEAM per contest (a user may enter many teams).
create table if not exists public.tournament_entries (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  roster_id     uuid not null references public.rosters(id) on delete cascade,
  points        numeric not null default 0,
  created_at    timestamptz not null default now()
);
-- Reconcile uniqueness to the FINAL rule (drop the old per-user rule if present).
alter table public.tournament_entries drop constraint if exists tournament_entries_tournament_id_user_id_key;
alter table public.tournament_entries drop constraint if exists tournament_entries_tournament_id_roster_id_key;
alter table public.tournament_entries add constraint tournament_entries_tournament_id_roster_id_key
  unique (tournament_id, roster_id);
create index if not exists tournament_entries_user_idx on public.tournament_entries (user_id);

-- Editable scoring config (single row)
create table if not exists public.scoring_rules (
  id                      integer primary key default 1,
  points_per_kill         integer not null default 5,
  points_per_knock        integer not null default 5,
  self_knock_penalty      integer not null default -5,
  captain_multiplier      numeric not null default 2.0,
  vice_captain_multiplier numeric not null default 1.5,
  constraint single_row check (id = 1)
);
insert into public.scoring_rules (id) values (1) on conflict (id) do nothing;


-- ----------------------------------------------------------------------------
--  SIGNUP BONUS: give every new user a profile, a wallet (1000), and a receipt
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone, username)
  values (new.id, new.email, new.raw_user_meta_data ->> 'phone', new.raw_user_meta_data ->> 'username');

  insert into public.wallets (user_id, balance) values (new.id, 1000);

  insert into public.transactions (user_id, amount, type, description)
  values (new.id, 1000, 'credit', 'Welcome bonus - 1000 E-Tokens');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ----------------------------------------------------------------------------
--  ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
--  Users touch only their OWN profile/wallet/transactions/rosters/entries.
--  Reference data (matches, players, teams, stats, contests, rules) is public
--  read. All WRITES to game data happen through the SECURITY DEFINER functions
--  in 02_functions.sql (which enforce the rules), so no write policies are
--  needed on those tables.
-- ----------------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.wallets            enable row level security;
alter table public.transactions       enable row level security;
alter table public.esports_teams      enable row level security;
alter table public.players            enable row level security;
alter table public.matches            enable row level security;
alter table public.match_player_stats enable row level security;
alter table public.rosters            enable row level security;
alter table public.roster_players     enable row level security;
alter table public.tournaments        enable row level security;
alter table public.tournament_entries enable row level security;
alter table public.scoring_rules      enable row level security;

drop policy if exists "read own profile"        on public.profiles;
drop policy if exists "update own profile"       on public.profiles;
create policy "read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "read own wallet" on public.wallets;
create policy "read own wallet" on public.wallets for select using (auth.uid() = user_id);

drop policy if exists "read own transactions" on public.transactions;
create policy "read own transactions" on public.transactions for select using (auth.uid() = user_id);

drop policy if exists "read own rosters"   on public.rosters;
drop policy if exists "create own rosters" on public.rosters;
drop policy if exists "update own rosters" on public.rosters;
create policy "read own rosters"   on public.rosters for select using (auth.uid() = user_id);
create policy "create own rosters" on public.rosters for insert with check (auth.uid() = user_id);
create policy "update own rosters" on public.rosters for update using (auth.uid() = user_id);

drop policy if exists "read own roster players" on public.roster_players;
create policy "read own roster players" on public.roster_players for select
  using (exists (select 1 from public.rosters r where r.id = roster_id and r.user_id = auth.uid()));

drop policy if exists "read own entries" on public.tournament_entries;
create policy "read own entries" on public.tournament_entries for select using (auth.uid() = user_id);

drop policy if exists "anyone reads teams"   on public.esports_teams;
drop policy if exists "anyone reads players" on public.players;
drop policy if exists "anyone reads matches" on public.matches;
drop policy if exists "anyone reads stats"   on public.match_player_stats;
drop policy if exists "anyone reads contests" on public.tournaments;
drop policy if exists "anyone reads rules"   on public.scoring_rules;
create policy "anyone reads teams"    on public.esports_teams      for select using (true);
create policy "anyone reads players"  on public.players            for select using (true);
create policy "anyone reads matches"  on public.matches            for select using (true);
create policy "anyone reads stats"    on public.match_player_stats for select using (true);
create policy "anyone reads contests" on public.tournaments        for select using (true);
create policy "anyone reads rules"    on public.scoring_rules      for select using (true);

-- ============================================================================
--  DONE. Next: run 02_functions.sql
-- ============================================================================
