-- ============================================================================
--  E-FANTASY  ::  02_functions.sql   (all game + admin logic)
-- ============================================================================
--  RUN AFTER 01_schema.sql. Idempotent (safe to re-run).
--  This is the FINAL, consolidated set of functions (replaces the versions that
--  used to be scattered across phase2..phase8). A few functions changed shape
--  over time, so their old signatures are dropped first.
-- ============================================================================

-- Drop old/changed signatures so only the final definitions remain.
drop function if exists public.save_roster(uuid, uuid, uuid[], uuid, uuid);
drop function if exists public.admin_create_tournament(uuid, text, integer, integer, integer);          -- old (with prize_pool)
drop function if exists public.admin_create_tournament(uuid, text, integer, integer, integer, integer);  -- prior consolidated (with prize_pool)
drop function if exists public.get_tournament_leaderboard(uuid);


-- ----------------------------------------------------------------------------
--  Helpers
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce((select is_admin from public.profiles where id = auth.uid()), false); $$;

-- Base points for one player's stat line (before Captain/VC multiplier).
create or replace function public.player_base_points(p_kills integer, p_knocks integer, p_self_knocks integer)
returns numeric language plpgsql stable as $$
declare r public.scoring_rules;
begin
  select * into r from public.scoring_rules where id = 1;
  return (p_kills * r.points_per_kill) + (p_knocks * r.points_per_knock) + (p_self_knocks * r.self_knock_penalty);
end; $$;

-- Total points for a roster (applies Captain 2x / Vice-Captain 1.5x).
create or replace function public.calculate_roster_points(p_roster_id uuid)
returns numeric language plpgsql stable set search_path = public as $$
declare r public.scoring_rules; total numeric;
begin
  select * into r from public.scoring_rules where id = 1;
  select coalesce(sum(
      (s.kills * r.points_per_kill + s.knocks * r.points_per_knock + s.self_knocks * r.self_knock_penalty)
      * case when rp.is_captain then r.captain_multiplier
             when rp.is_vice_captain then r.vice_captain_multiplier
             else 1.0 end
    ), 0)
  into total
  from public.roster_players rp
  join public.rosters r2 on r2.id = rp.roster_id
  join public.match_player_stats s on s.player_id = rp.player_id and s.match_id = r2.match_id
  where rp.roster_id = p_roster_id;
  return total;
end; $$;


-- ----------------------------------------------------------------------------
--  save_roster  -- create a NEW team (p_roster_id null) or EDIT one
-- ----------------------------------------------------------------------------
create or replace function public.save_roster(
  p_roster_id       uuid,
  p_match_id        uuid,
  p_team_id         uuid,
  p_player_ids      uuid[],
  p_captain_id      uuid,
  p_vice_captain_id uuid,
  p_name            text
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_user_id  uuid := auth.uid();
  v_roster_id uuid;
  v_status   text;
  v_count    integer;
  v_new_name text;
begin
  if v_user_id is null then raise exception 'You must be signed in.'; end if;

  select status into v_status from public.matches where id = p_match_id;
  if v_status is null then raise exception 'Match not found.'; end if;
  if v_status <> 'upcoming' then raise exception 'Teams are locked — this match has already started.'; end if;

  if coalesce(array_length(p_player_ids, 1), 0) <> 12 then raise exception 'You must pick exactly 12 players.'; end if;
  if (select count(distinct x) from unnest(p_player_ids) as x) <> 12 then raise exception 'All 12 players must be different.'; end if;
  if p_captain_id = p_vice_captain_id then raise exception 'Captain and Vice-Captain must be two different players.'; end if;
  if not (p_captain_id = any(p_player_ids)) then raise exception 'The Captain must be one of your 12 players.'; end if;
  if not (p_vice_captain_id = any(p_player_ids)) then raise exception 'The Vice-Captain must be one of your 12 players.'; end if;

  if p_roster_id is null then
    select count(*) + 1 into v_count from public.rosters where user_id = v_user_id and match_id = p_match_id;
    v_new_name := coalesce(nullif(trim(p_name), ''), 'Team ' || v_count);
    insert into public.rosters (user_id, match_id, team_id, name)
    values (v_user_id, p_match_id, p_team_id, v_new_name)
    returning id into v_roster_id;
  else
    update public.rosters
       set team_id = p_team_id, name = coalesce(nullif(trim(p_name), ''), name)
     where id = p_roster_id and user_id = v_user_id and match_id = p_match_id
    returning id into v_roster_id;
    if v_roster_id is null then raise exception 'Team not found (or not yours).'; end if;
  end if;

  delete from public.roster_players where roster_id = v_roster_id;
  insert into public.roster_players (roster_id, player_id, is_captain, is_vice_captain)
  select v_roster_id, pid, (pid = p_captain_id), (pid = p_vice_captain_id)
  from unnest(p_player_ids) as pid;

  return v_roster_id;
end; $$;


-- ----------------------------------------------------------------------------
--  join_tournament  -- multi-entry (one entry per team), optional per-user cap
-- ----------------------------------------------------------------------------
create or replace function public.join_tournament(p_tournament_id uuid, p_roster_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_fee integer; v_name text; v_match_id uuid; v_max integer; v_current integer;
  v_max_per_user integer; v_user_count integer; v_roster_match uuid; v_balance integer; v_status text;
begin
  if v_user_id is null then raise exception 'You must be signed in.'; end if;

  select match_id, name, entry_fee, max_entries, current_entries, max_entries_per_user
    into v_match_id, v_name, v_fee, v_max, v_current, v_max_per_user
  from public.tournaments where id = p_tournament_id for update;
  if not found then raise exception 'Tournament not found.'; end if;

  select status into v_status from public.matches where id = v_match_id;
  if v_status <> 'upcoming' then raise exception 'Entries are closed — this match has already started.'; end if;

  select match_id into v_roster_match from public.rosters where id = p_roster_id and user_id = v_user_id;
  if not found then raise exception 'That team does not belong to you.'; end if;
  if v_roster_match <> v_match_id then raise exception 'That team was built for a different match.'; end if;

  if exists (select 1 from public.tournament_entries where tournament_id = p_tournament_id and roster_id = p_roster_id) then
    raise exception 'This team is already in this contest.';
  end if;

  if v_max_per_user is not null then
    select count(*) into v_user_count from public.tournament_entries where tournament_id = p_tournament_id and user_id = v_user_id;
    if v_user_count >= v_max_per_user then raise exception 'You can enter at most % team(s) in this contest.', v_max_per_user; end if;
  end if;

  if v_max is not null and v_current >= v_max then raise exception 'This contest is full.'; end if;

  select balance into v_balance from public.wallets where user_id = v_user_id for update;
  if v_balance < v_fee then raise exception 'Not enough E-Tokens. You need % but have %.', v_fee, v_balance; end if;

  if v_fee > 0 then
    update public.wallets set balance = balance - v_fee, updated_at = now() where user_id = v_user_id;
    insert into public.transactions (user_id, amount, type, description) values (v_user_id, -v_fee, 'debit', 'Joined: ' || v_name);
  end if;

  insert into public.tournament_entries (tournament_id, user_id, roster_id) values (p_tournament_id, v_user_id, p_roster_id);
  -- Prize pool = sum of all entry fees, so it grows by this fee on every join.
  update public.tournaments set current_entries = current_entries + 1, prize_pool = prize_pool + v_fee where id = p_tournament_id;
end; $$;


-- ----------------------------------------------------------------------------
--  get_tournament_leaderboard  -- ranks entries; frozen points once completed
-- ----------------------------------------------------------------------------
create function public.get_tournament_leaderboard(p_tournament_id uuid)
returns table (rank bigint, roster_id uuid, user_id uuid, username text, team_name text, points numeric, is_you boolean)
language sql stable security definer set search_path = public as $$
  with meta as (
    select m.status from public.tournaments t join public.matches m on m.id = t.match_id where t.id = p_tournament_id
  ),
  scored as (
    select te.roster_id, te.user_id,
           coalesce(pr.username, 'Player') as username,
           coalesce(r.name, 'Team') as team_name,
           case when (select status from meta) = 'completed'
                then te.points
                else public.calculate_roster_points(te.roster_id) end as points
    from public.tournament_entries te
    left join public.profiles pr on pr.id = te.user_id
    left join public.rosters  r  on r.id  = te.roster_id
    where te.tournament_id = p_tournament_id
  )
  select rank() over (order by points desc) as rank, roster_id, user_id, username, team_name, points, (user_id = auth.uid())
  from scored order by points desc, username asc, team_name asc;
$$;


-- ----------------------------------------------------------------------------
--  admin_add_event  -- quick-tap scoring (+/-1); locked once match completed
-- ----------------------------------------------------------------------------
create or replace function public.admin_add_event(p_match_id uuid, p_player_id uuid, p_field text, p_delta integer)
returns table (kills integer, knocks integer, self_knocks integer)
language plpgsql security definer set search_path = public as $$
declare v_status text;
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;
  if p_field not in ('kills', 'knocks', 'self_knocks') then raise exception 'Invalid event type: %', p_field; end if;

  select status into v_status from public.matches where id = p_match_id;
  if v_status = 'completed' then raise exception 'This match is finalized — scores are locked.'; end if;

  insert into public.match_player_stats (match_id, player_id, kills, knocks, self_knocks)
  values (p_match_id, p_player_id,
          greatest(0, case when p_field = 'kills' then p_delta else 0 end),
          greatest(0, case when p_field = 'knocks' then p_delta else 0 end),
          greatest(0, case when p_field = 'self_knocks' then p_delta else 0 end))
  on conflict (match_id, player_id) do update set
    kills       = greatest(0, match_player_stats.kills       + case when p_field = 'kills' then p_delta else 0 end),
    knocks      = greatest(0, match_player_stats.knocks      + case when p_field = 'knocks' then p_delta else 0 end),
    self_knocks = greatest(0, match_player_stats.self_knocks + case when p_field = 'self_knocks' then p_delta else 0 end);

  return query select s.kills, s.knocks, s.self_knocks
  from public.match_player_stats s where s.match_id = p_match_id and s.player_id = p_player_id;
end; $$;


-- ----------------------------------------------------------------------------
--  finalize_match  -- mark completed, freeze points, pay top 3 (50/30/20)
-- ----------------------------------------------------------------------------
create or replace function public.finalize_match(p_match_id uuid)
returns table (tournament_name text, username text, rank bigint, award integer)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare t record;
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;

  update public.matches set status = 'completed', completed_at = now() where id = p_match_id;

  update public.rosters r set total_points = public.calculate_roster_points(r.id) where r.match_id = p_match_id;

  for t in select id, name, prize_pool from public.tournaments where match_id = p_match_id and settled = false
  loop
    update public.tournament_entries te set points = public.calculate_roster_points(te.roster_id) where te.tournament_id = t.id;

    return query
    with ranked as (
      select te.user_id, te.points as pts,
             rank() over (order by te.points desc) as rnk,
             row_number() over (order by te.points desc) as pos
      from public.tournament_entries te
      where te.tournament_id = t.id and te.points > 0
    ),
    payouts(pos, pct) as (values (1, 50), (2, 30), (3, 20)),
    group_share as (
      select r.rnk, count(*) as members, coalesce(sum(p.pct), 0) as total_pct
      from ranked r left join payouts p on p.pos = r.pos group by r.rnk
    ),
    awards as (
      select r.user_id, r.rnk, floor(t.prize_pool * gs.total_pct / 100.0 / gs.members)::int as award
      from ranked r join group_share gs on gs.rnk = r.rnk where gs.total_pct > 0
    ),
    winners as (select * from awards where awards.award > 0),
    paid as (
      update public.wallets w set balance = balance + wn.award, updated_at = now()
      from winners wn where w.user_id = wn.user_id
      returning wn.user_id, wn.award, wn.rnk
    ),
    logged as (
      insert into public.transactions (user_id, amount, type, description)
      select p.user_id, p.award, 'credit', 'Prize: ' || t.name || ' (Rank ' || p.rnk || ')' from paid p
      returning user_id
    )
    select t.name, coalesce(pr.username, 'Player'), wn.rnk, wn.award
    from winners wn left join public.profiles pr on pr.id = wn.user_id order by wn.rnk;

    update public.tournaments set settled = true where id = t.id;
  end loop;
end; $$;


-- ----------------------------------------------------------------------------
--  admin_set_match_live  -- move an upcoming match to LIVE (closes entries)
-- ----------------------------------------------------------------------------
create or replace function public.admin_set_match_live(p_match_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_status text;
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;
  select status into v_status from public.matches where id = p_match_id;
  if v_status is null then raise exception 'Match not found.'; end if;
  if v_status = 'completed' then raise exception 'This match is already completed.'; end if;
  -- upcoming (or already live) -> live
  update public.matches set status = 'live' where id = p_match_id;
end; $$;


-- ----------------------------------------------------------------------------
--  Admin: create content
-- ----------------------------------------------------------------------------
create or replace function public.admin_create_team(p_name text, p_game text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Team name is required.'; end if;
  insert into public.esports_teams (name, game) values (trim(p_name), coalesce(nullif(trim(p_game), ''), 'BGMI')) returning id into v_id;
  return v_id;
end; $$;

create or replace function public.admin_create_player(p_name text, p_team_id uuid, p_game text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Player name is required.'; end if;
  if p_team_id is not null and not exists (select 1 from public.esports_teams where id = p_team_id) then
    raise exception 'That team does not exist.';
  end if;
  insert into public.players (name, team_id, game) values (trim(p_name), p_team_id, coalesce(nullif(trim(p_game), ''), 'BGMI')) returning id into v_id;
  return v_id;
end; $$;

create or replace function public.admin_create_match(p_title text, p_game text, p_map_name text, p_start_time timestamptz, p_status text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_status text;
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;
  if coalesce(trim(p_title), '') = '' then raise exception 'Match title is required.'; end if;
  v_status := coalesce(p_status, 'upcoming');
  if v_status not in ('upcoming', 'live', 'completed') then raise exception 'Status must be upcoming, live or completed.'; end if;
  insert into public.matches (title, game, map_name, start_time, status, completed_at)
  values (trim(p_title), coalesce(nullif(trim(p_game), ''), 'BGMI'), nullif(trim(p_map_name), ''),
          coalesce(p_start_time, now()), v_status, case when v_status = 'completed' then now() else null end)
  returning id into v_id;
  return v_id;
end; $$;

-- NOTE: no prize_pool parameter — the prize pool is the SUM of entry fees and
-- grows automatically as users join (see join_tournament). Starts at 0.
create function public.admin_create_tournament(
  p_match_id uuid, p_name text, p_entry_fee integer, p_max_entries integer, p_max_entries_per_user integer)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_status text;
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;
  select status into v_status from public.matches where id = p_match_id;
  if v_status is null then raise exception 'Pick a valid match for this contest.'; end if;
  if v_status <> 'upcoming' then raise exception 'Contests can only be added to upcoming matches.'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Contest name is required.'; end if;
  if coalesce(p_entry_fee, 0) < 0 then raise exception 'Entry fee cannot be negative.'; end if;
  if p_max_entries is not null and p_max_entries <= 0 then raise exception 'Max entries must be positive (or blank).'; end if;
  if p_max_entries_per_user is not null and p_max_entries_per_user <= 0 then raise exception 'Max teams per user must be positive (or blank).'; end if;
  insert into public.tournaments (match_id, name, entry_fee, max_entries, max_entries_per_user)
  values (p_match_id, trim(p_name), coalesce(p_entry_fee, 0), p_max_entries, p_max_entries_per_user)
  returning id into v_id;
  return v_id;
end; $$;


-- ----------------------------------------------------------------------------
--  admin_delete_tournament  -- delete a contest and refund every entry fee
-- ----------------------------------------------------------------------------
--  Refunds each entrant the fee they paid PER team entered, writes a "Refund"
--  receipt, then deletes the contest (cascades its entries). Blocked once the
--  contest is settled/paid, so winners are never double-paid.
create or replace function public.admin_delete_tournament(p_tournament_id uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare v_fee integer; v_name text; v_settled boolean; v_count integer;
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;

  select entry_fee, name, settled into v_fee, v_name, v_settled
  from public.tournaments where id = p_tournament_id for update;
  if not found then raise exception 'Contest not found.'; end if;
  if v_settled then raise exception 'This contest has already been paid out — it cannot be deleted with a refund.'; end if;

  select count(*) into v_count from public.tournament_entries where tournament_id = p_tournament_id;

  if v_fee > 0 then
    -- Refund each user the TOTAL they paid (fee x number of their teams entered).
    update public.wallets w
       set balance = balance + agg.refund, updated_at = now()
      from (
        select user_id, count(*) * v_fee as refund
        from public.tournament_entries
        where tournament_id = p_tournament_id
        group by user_id
      ) agg
     where agg.user_id = w.user_id;

    -- One refund receipt per entry (mirrors the join debits in wallet history).
    insert into public.transactions (user_id, amount, type, description)
    select user_id, v_fee, 'credit', 'Refund: ' || v_name
    from public.tournament_entries where tournament_id = p_tournament_id;
  end if;

  delete from public.tournaments where id = p_tournament_id;  -- cascades entries
  return v_count;
end; $$;


-- ----------------------------------------------------------------------------
--  cleanup_old_matches  -- delete matches completed > 5 days ago (cascades)
-- ----------------------------------------------------------------------------
--  Deleting a match cascades to its tournaments, entries, rosters and stats.
--  Wallets and transaction history are NOT touched. Admin/cron only.
create or replace function public.cleanup_old_matches()
returns integer language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  with deleted as (
    delete from public.matches
    where status = 'completed' and completed_at is not null and completed_at < now() - interval '5 days'
    returning 1
  )
  select count(*) into v_count from deleted;
  return v_count;
end; $$;


-- ----------------------------------------------------------------------------
--  Grants
-- ----------------------------------------------------------------------------
grant execute on function public.is_admin() to authenticated;
grant execute on function public.save_roster(uuid, uuid, uuid, uuid[], uuid, uuid, text) to authenticated;
grant execute on function public.join_tournament(uuid, uuid) to authenticated;
grant execute on function public.get_tournament_leaderboard(uuid) to authenticated;
grant execute on function public.admin_add_event(uuid, uuid, text, integer) to authenticated;
grant execute on function public.finalize_match(uuid) to authenticated;
grant execute on function public.admin_set_match_live(uuid) to authenticated;
grant execute on function public.admin_create_team(text, text) to authenticated;
grant execute on function public.admin_create_player(text, uuid, text) to authenticated;
grant execute on function public.admin_create_match(text, text, text, timestamptz, text) to authenticated;
grant execute on function public.admin_create_tournament(uuid, text, integer, integer, integer) to authenticated;
grant execute on function public.admin_delete_tournament(uuid) to authenticated;

-- cleanup is admin/cron only — keep it away from normal users.
revoke execute on function public.cleanup_old_matches() from public;

-- ============================================================================
--  DONE. Next: run 03_seed.sql (sample data). For auto-delete, see 04_cleanup_cron.sql.
-- ============================================================================
