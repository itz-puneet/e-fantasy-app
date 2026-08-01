-- ============================================================================
--  WARNING: This will permanently delete ALL users and their related data!
-- ============================================================================
--  Due to the "ON DELETE CASCADE" constraints in your schema, deleting records
--  from auth.users will automatically clean up the associated rows in:
--    - public.profiles
--    - public.wallets
--    - public.transactions
--    - public.rosters
--    - public.tournament_entries
--    - etc.
-- ============================================================================

DELETE FROM auth.users;
