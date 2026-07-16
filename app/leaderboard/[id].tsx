// ============================================================================
//  app/leaderboard/[id].tsx  ->  TOURNAMENT LEADERBOARD
//  Ranks every player in a contest by their fantasy team's points (highest
//  first), via the get_tournament_leaderboard() database function. Shows a
//  LIVE / COMPLETED status and the "official within 1 hour" note.
// ============================================================================
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FadeInItem from '../../components/FadeInItem';
import RankRow, { type LeaderboardEntry } from '../../components/RankRow';
import ScreenHeader from '../../components/ScreenHeader';
import StatusPill from '../../components/StatusPill';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../../constants/theme';
import { formatPoints } from '../../lib/format';
import { supabase } from '../../lib/supabase';

type TournamentInfo = {
  name: string;
  match: { title: string; status: string; start_time: string } | null;
};

export default function Leaderboard() {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [info, setInfo] = useState<TournamentInfo | null>(null);
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;

    const [tRes, lbRes] = await Promise.all([
      supabase.from('tournaments').select('name, match:matches(title, status, start_time)').eq('id', id).single(),
      supabase.rpc('get_tournament_leaderboard', { p_tournament_id: id }),
    ]);

    if (tRes.data) setInfo(tRes.data as unknown as TournamentInfo);
    if (lbRes.data) {
      setRows(
        (lbRes.data as any[]).map((r) => ({
          rank: Number(r.rank),
          roster_id: r.roster_id,
          user_id: r.user_id,
          username: r.username,
          team_name: r.team_name,
          points: r.points,
          is_you: r.is_you,
        }))
      );
    }
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const status = info?.match?.status ?? 'upcoming';
  // A user can have several teams here; show their BEST one in the summary.
  const myEntries = rows.filter((r) => r.is_you);
  const me = myEntries[0];

  return (
    <View style={styles.container}>
      <ScreenHeader title="Leaderboard" subtitle={info?.name} />

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => r.roster_id}
          renderItem={({ item, index }) => (
            <FadeInItem index={index} withLayout animKey={item.roster_id}>
              <RankRow entry={item} />
            </FadeInItem>
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListHeaderComponent={
            <View>
              {/* Status + match line */}
              <View style={styles.statusRow}>
                <Text style={styles.matchTitle} numberOfLines={1}>
                  {info?.match?.title ?? 'Match'}
                </Text>
                <StatusPill status={status} />
              </View>

              {/* Your rank summary (best of your teams) */}
              {me ? (
                <View style={styles.youCard}>
                  <Text style={styles.youLabel}>
                    {myEntries.length > 1 ? `Your best (of ${myEntries.length} teams)` : 'Your position'}
                  </Text>
                  <View style={styles.youStats}>
                    <Text style={styles.youRank}>
                      #{me.rank} <Text style={styles.youOf}>of {rows.length}</Text>
                    </Text>
                    <Text style={styles.youPoints}>{formatPoints(me.points)} pts</Text>
                  </View>
                </View>
              ) : null}

              {/* Official-update note (placeholder) */}
              <View style={styles.note}>
                <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
                <Text style={styles.noteText}>
                  {status === 'completed'
                    ? 'The match has ended. Points shown are provisional — official final standings are confirmed within 1 hour of the match finishing.'
                    : status === 'live'
                    ? 'Match is LIVE — points update as the game is played. Official final standings are confirmed within 1 hour of the match ending.'
                    : "This match hasn't started yet. The leaderboard fills in once play begins."}
                </Text>
              </View>

              <Text style={styles.rankingsTitle}>Rankings</Text>
            </View>
          }
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>No entries yet for this contest.</Text>
          }
        />
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  matchTitle: { color: colors.textMuted, fontSize: font.md, fontWeight: '600', flex: 1 },

  youCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  youLabel: { color: colors.onPrimaryMuted, fontSize: font.sm, fontWeight: '700' },
  youStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  youRank: { color: colors.onPrimary, fontSize: font.xl, fontWeight: '900' },
  youOf: { color: colors.onPrimaryMuted, fontSize: font.md, fontWeight: '700' },
  youPoints: { color: colors.onPrimary, fontSize: font.lg, fontWeight: '800' },

  note: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  noteText: { flex: 1, color: colors.textMuted, fontSize: font.sm, lineHeight: 19 },

  rankingsTitle: {
    color: colors.text,
    fontSize: font.lg,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
