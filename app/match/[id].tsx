// ============================================================================
//  app/match/[id].tsx  ->  MATCH DETAILS
//  Shows the match info, YOUR TEAMS for this match (you can build several), and
//  every contest tied to the match. Tapping a contest opens its details.
// ============================================================================
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import TournamentCard, { type Tournament } from '../../components/TournamentCard';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';
import { formatMatchTime } from '../../lib/format';
import { supabase } from '../../lib/supabase';

type Match = {
  id: string;
  title: string;
  map_name: string | null;
  start_time: string;
  status: string;
};
type Team = { id: string; name: string | null };

export default function MatchDetails() {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  const [match, setMatch] = useState<Match | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const userId = session?.user.id;
    if (!id || !userId) return;

    const [matchRes, tourRes, entryRes, rosterRes] = await Promise.all([
      supabase.from('matches').select('id, title, map_name, start_time, status').eq('id', id).single(),
      supabase
        .from('tournaments')
        .select('id, match_id, name, entry_fee, prize_pool, max_entries, current_entries')
        .eq('match_id', id)
        .order('entry_fee', { ascending: true }),
      supabase.from('tournament_entries').select('tournament_id').eq('user_id', userId),
      // A user can now have MANY teams per match.
      supabase.from('rosters').select('id, name').eq('user_id', userId).eq('match_id', id).order('created_at'),
    ]);

    if (matchRes.data) setMatch(matchRes.data as Match);
    if (tourRes.data) setTournaments(tourRes.data as Tournament[]);
    if (entryRes.data) setJoinedIds(new Set(entryRes.data.map((e) => e.tournament_id)));
    if (rosterRes.data) setTeams(rosterRes.data as Team[]);
    setLoading(false);
  }, [id, session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const locked = !!match && match.status !== 'upcoming';

  return (
    <View style={styles.container}>
      <ScreenHeader title={match?.title ?? 'Match'} subtitle={match ? 'Your teams & contests' : undefined} />

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <TournamentCard
              tournament={item}
              joined={joinedIds.has(item.id)}
              onPress={() => router.push(`/tournament/${item.id}`)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListHeaderComponent={
            <View>
              {match ? (
                <View style={styles.metaRow}>
                  {match.map_name ? <MetaItem icon="map-outline" text={match.map_name} /> : null}
                  <MetaItem icon="time-outline" text={formatMatchTime(match.start_time)} />
                </View>
              ) : null}

              {/* Your teams (multiple allowed) */}
              <View style={styles.teamsCard}>
                <View style={styles.teamsHeader}>
                  <Text style={styles.teamsTitle}>Your Teams ({teams.length})</Text>
                  {!locked ? (
                    <Pressable onPress={() => router.push(`/team/${id}`)} hitSlop={8}>
                      <Text style={styles.addLink}>+ Create</Text>
                    </Pressable>
                  ) : (
                    <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
                  )}
                </View>

                {teams.length === 0 ? (
                  <Text style={styles.teamsEmpty}>
                    {locked
                      ? 'Team building is closed — this match has started.'
                      : 'No teams yet. Create one (12 players + 1 team) to join contests.'}
                  </Text>
                ) : (
                  teams.map((t) => (
                    <Pressable
                      key={t.id}
                      disabled={locked}
                      onPress={() => router.push(`/team/${id}?rosterId=${t.id}`)}
                      style={({ pressed }) => [styles.teamRow, pressed && !locked && { opacity: 0.6 }]}
                    >
                      <Ionicons name="people" size={18} color={colors.primary} />
                      <Text style={styles.teamName}>{t.name ?? 'Team'}</Text>
                      {locked ? null : <Text style={styles.editLink}>Edit</Text>}
                    </Pressable>
                  ))
                )}
              </View>

              <Text style={styles.sectionTitle}>Contests</Text>
            </View>
          }
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
          }}
          ListEmptyComponent={<Text style={styles.empty}>No contests for this match yet.</Text>}
        />
      )}
    </View>
  );
}

function MetaItem({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={15} color={colors.textMuted} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  metaRow: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.lg },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: colors.textMuted, fontSize: font.md },

  teamsCard: {
    ...shadow,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  teamsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamsTitle: { color: colors.text, fontSize: font.md, fontWeight: '800' },
  addLink: { color: colors.primary, fontSize: font.md, fontWeight: '700' },
  teamsEmpty: { color: colors.textMuted, fontSize: font.sm, marginTop: spacing.sm, lineHeight: 18 },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  teamName: { flex: 1, color: colors.text, fontSize: font.md, fontWeight: '600' },
  editLink: { color: colors.primary, fontSize: font.sm, fontWeight: '700' },

  sectionTitle: {
    color: colors.text,
    fontSize: font.lg,
    fontWeight: '800',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
