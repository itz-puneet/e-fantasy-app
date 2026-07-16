-- ============================================================================
--  E-FANTASY  ::  04_cleanup_cron.sql   (OPTIONAL — auto-delete old matches)
-- ============================================================================
--  This schedules a daily job that runs cleanup_old_matches() (defined in
--  02_functions.sql), which deletes matches 5 days after they were completed —
--  along with their contests, entries, teams and stats. Wallets and transaction
--  history are kept.
--
--  It needs the pg_cron extension. If the CREATE EXTENSION line errors, enable
--  pg_cron first: Supabase Dashboard -> Database -> Extensions -> search
--  "pg_cron" -> enable, then run this file again.
--
--  Run this ONCE (after 02_functions.sql). Re-running just updates the job.
--  Everything else in the app works without this file — matches simply won't
--  auto-delete until you set it up. You can also run cleanup manually anytime:
--      select public.cleanup_old_matches();
-- ============================================================================

create extension if not exists pg_cron;

-- Daily at 03:00 UTC. Scheduling with the same job name replaces the old one.
select cron.schedule(
  'cleanup-old-matches',
  '0 3 * * *',
  $$ select public.cleanup_old_matches(); $$
);

-- To see it:      select * from cron.job where jobname = 'cleanup-old-matches';
-- To remove it:   select cron.unschedule('cleanup-old-matches');
-- ============================================================================
