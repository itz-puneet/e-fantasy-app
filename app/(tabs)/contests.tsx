// ============================================================================
//  app/(tabs)/contests.tsx  ->  MY CONTESTS
//  Lists every tournament the signed-in user has joined. Tapping one opens its
//  leaderboard.
// ============================================================================
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ContestCard, { type JoinedContest } from '../../components/ContestCard';
import FadeInItem from '../../components/FadeInItem';
import { font, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

export default function MyContests() {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuth();

  const [contests, setContests] = useState<JoinedContest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const userId = session?.user.id;
    if (!userId) return;

    // RLS lets a user read their OWN entries; tournaments + matches are public.
    const { data, error } = await supabase
      .from('tournament_entries')
      .select(
        'id, created_at, tournament:tournaments(id, name, entry_fee, prize_pool, match:matches(title, status, start_time)), roster:rosters(name)'
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped: JoinedContest[] = data
        .filter((row: any) => row.tournament) // guard against deleted tournaments
        .map((row: any) => ({
          entryId: row.id,
          tournamentId: row.tournament.id,
          name: row.tournament.name,
          teamName: row.roster?.name ?? 'Team',
          entryFee: row.tournament.entry_fee,
          prizePool: row.tournament.prize_pool,
          matchTitle: row.tournament.match?.title ?? 'Match',
          matchStatus: row.tournament.match?.status ?? 'upcoming',
          startTime: row.tournament.match?.start_time ?? new Date().toISOString(),
        }));
      setContests(mapped);
    }
    setLoading(false);
    setRefreshing(false);
  }, [session]);

  // Refresh whenever the tab is focused (e.g. right after joining a contest).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <Text style={styles.heading}>My Contests</Text>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={contests}
          keyExtractor={(c) => c.entryId}
          renderItem={({ item, index }) => (
            <FadeInItem index={index} animKey={item.entryId}>
              <ContestCard contest={item} onPress={() => router.push(`/leaderboard/${item.tournamentId}`)} />
            </FadeInItem>
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="trophy-outline" size={52} color={colors.textFaint} />
              <Text style={styles.emptyTitle}>No contests yet</Text>
              <Text style={styles.emptyText}>
                Open a match from the Matches tab, build your team, and join a
                contest. It'll show up here.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  heading: {
    color: colors.text,
    fontSize: font.xxl,
    fontWeight: '900',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  empty: { alignItems: 'center', marginTop: spacing.xl * 2, paddingHorizontal: spacing.xl },
  emptyTitle: { color: colors.text, fontSize: font.lg, fontWeight: '800', marginTop: spacing.md },
  emptyText: {
    color: colors.textMuted,
    fontSize: font.md,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});
