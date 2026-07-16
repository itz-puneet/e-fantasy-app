-- ============================================================================
--  E-FANTASY  ::  03_seed.sql   (sample data + make yourself admin)
-- ============================================================================
--  RUN AFTER 02_functions.sql.
--  Each block only inserts if that table is EMPTY, so running this on a project
--  that already has data does nothing (no duplicates). Safe to re-run.
-- ============================================================================

-- ---- Teams ----------------------------------------------------------------
insert into public.esports_teams (id, name, game)
select v.id::uuid, v.name, v.game from (values
  ('11111111-1111-1111-1111-111111111111', 'Godlike Esports', 'BGMI'),
  ('22222222-2222-2222-2222-222222222222', 'Soul',            'BGMI'),
  ('33333333-3333-3333-3333-333333333333', 'Team XSpark',     'BGMI'),
  ('44444444-4444-4444-4444-444444444444', 'GamingGeeks',     'BGMI')
) as v(id, name, game)
where not exists (select 1 from public.esports_teams);

-- ---- Players (18 — enough to build multiple 12-player teams) ---------------
insert into public.players (id, name, team_id, game)
select v.id::uuid, v.name, v.team_id::uuid, 'BGMI' from (values
  ('aaaa0001-0000-0000-0000-000000000001', 'Jonathan', '11111111-1111-1111-1111-111111111111'),
  ('aaaa0001-0000-0000-0000-000000000002', 'ZGOD',     '11111111-1111-1111-1111-111111111111'),
  ('aaaa0001-0000-0000-0000-000000000003', 'Sc0utOP',  '11111111-1111-1111-1111-111111111111'),
  ('aaaa0001-0000-0000-0000-000000000004', 'Clutchgod','11111111-1111-1111-1111-111111111111'),
  ('aaaa0001-0000-0000-0000-000000000005', 'Manya',    '11111111-1111-1111-1111-111111111111'),
  ('aaaa0001-0000-0000-0000-000000000006', 'Neyoo',    '22222222-2222-2222-2222-222222222222'),
  ('aaaa0001-0000-0000-0000-000000000007', 'Omega',    '22222222-2222-2222-2222-222222222222'),
  ('aaaa0001-0000-0000-0000-000000000008', 'Akshat',   '22222222-2222-2222-2222-222222222222'),
  ('aaaa0001-0000-0000-0000-000000000009', 'Goblin',   '22222222-2222-2222-2222-222222222222'),
  ('aaaa0001-0000-0000-0000-000000000010', 'Mavi',     '22222222-2222-2222-2222-222222222222'),
  ('aaaa0001-0000-0000-0000-000000000011', 'Spraygod', '33333333-3333-3333-3333-333333333333'),
  ('aaaa0001-0000-0000-0000-000000000012', 'Aaru',     '33333333-3333-3333-3333-333333333333'),
  ('aaaa0001-0000-0000-0000-000000000013', 'Snax',     '33333333-3333-3333-3333-333333333333'),
  ('aaaa0001-0000-0000-0000-000000000014', 'Punkk',    '33333333-3333-3333-3333-333333333333'),
  ('aaaa0001-0000-0000-0000-000000000015', 'Sensei',   '44444444-4444-4444-4444-444444444444'),
  ('aaaa0001-0000-0000-0000-000000000016', 'Attanki',  '44444444-4444-4444-4444-444444444444'),
  ('aaaa0001-0000-0000-0000-000000000017', 'Destro',   '44444444-4444-4444-4444-444444444444'),
  ('aaaa0001-0000-0000-0000-000000000018', 'Nakul',    '44444444-4444-4444-4444-444444444444')
) as v(id, name, team_id)
where not exists (select 1 from public.players);

-- ---- Matches --------------------------------------------------------------
insert into public.matches (id, game, title, map_name, start_time, status, completed_at)
select v.id::uuid, 'BGMI', v.title, v.map_name, v.start_time::timestamptz, v.status, v.completed_at::timestamptz
from (values
  ('bbbb0001-0000-0000-0000-000000000001', 'BGMI Pro League - Grand Final', 'Erangel',  (now() + interval '2 days')::text,     'upcoming',  null),
  ('bbbb0001-0000-0000-0000-000000000002', 'BMPS - Semi Final Day 2',       'Miramar',  (now() + interval '1 day')::text,      'upcoming',  null),
  ('bbbb0001-0000-0000-0000-000000000003', 'Skyesports Masters - Match 12', 'Sanhok',   (now() + interval '3 hours')::text,    'upcoming',  null),
  ('bbbb0001-0000-0000-0000-000000000004', 'BGMI Weekly Cup - Match 8',     'Erangel',  (now() - interval '30 minutes')::text, 'live',      null),
  ('bbbb0001-0000-0000-0000-000000000005', 'BGMI Weekly Cup - Match 7',     'Vikendi',  (now() - interval '1 day')::text,      'completed', (now() - interval '1 day')::text)
) as v(id, title, map_name, start_time, status, completed_at)
where not exists (select 1 from public.matches);

-- ---- Contests (prize pool starts at 0 and grows from entry fees) ----------
insert into public.tournaments (id, match_id, name, entry_fee, max_entries, max_entries_per_user)
select v.id::uuid, v.match_id::uuid, v.name, v.entry_fee, v.max_entries, v.max_per_user
from (values
  ('cccc0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001', 'Free Practice Contest', 0,   10000, null),
  ('cccc0001-0000-0000-0000-000000000002', 'bbbb0001-0000-0000-0000-000000000001', 'Beginner Arena',        50,  1000,  3),
  ('cccc0001-0000-0000-0000-000000000003', 'bbbb0001-0000-0000-0000-000000000001', 'Pro Clash (Big Prize)', 200, 500,   1),
  ('cccc0001-0000-0000-0000-000000000004', 'bbbb0001-0000-0000-0000-000000000002', 'Free Practice Contest', 0,   10000, null),
  ('cccc0001-0000-0000-0000-000000000005', 'bbbb0001-0000-0000-0000-000000000002', 'Head to Head',          100, 200,   null),
  ('cccc0001-0000-0000-0000-000000000006', 'bbbb0001-0000-0000-0000-000000000003', 'Warm-up Free Contest',  0,   5000,  null),
  ('cccc0001-0000-0000-0000-000000000007', 'bbbb0001-0000-0000-0000-000000000003', 'Mega Contest',          150, 750,   5)
) as v(id, match_id, name, entry_fee, max_entries, max_per_user)
where not exists (select 1 from public.tournaments);

-- ---- Sample stats for the COMPLETED match (to demo scoring) ---------------
insert into public.match_player_stats (match_id, player_id, kills, knocks, self_knocks)
select v.match_id::uuid, v.player_id::uuid, v.kills, v.knocks, v.self_knocks
from (values
  ('bbbb0001-0000-0000-0000-000000000005', 'aaaa0001-0000-0000-0000-000000000001', 8, 6, 1),
  ('bbbb0001-0000-0000-0000-000000000005', 'aaaa0001-0000-0000-0000-000000000006', 5, 4, 0)
) as v(match_id, player_id, kills, knocks, self_knocks)
where not exists (select 1 from public.match_player_stats);


-- ============================================================================
--  MAKE YOURSELF AN ADMIN  <-- EDIT the email to YOUR login, then it's set.
--  (You must have registered that account in the app at least once first.)
-- ============================================================================
update public.profiles set is_admin = true where email = 'afler.here@gmail.com';

-- ============================================================================
--  DONE. (Optional) run 04_cleanup_cron.sql to auto-delete old matches.
-- ============================================================================
