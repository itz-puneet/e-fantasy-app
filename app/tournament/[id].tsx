// ============================================================================
//  app/tournament/[id].tsx  ->  TOURNAMENT DETAILS + JOIN
//  Shows the contest details and lets the user enter with ANY of their teams
//  for this match (multi-entry). Each team can be entered once; an optional
//  per-user cap may limit how many teams one user can enter.
// ============================================================================
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';
import { formatMatchTime, formatTokens } from '../../lib/format';
import { supabase } from '../../lib/supabase';

type TournamentDetail = {
  id: string;
  match_id: string;
  name: string;
  entry_fee: number;
  prize_pool: number;
  max_entries: number | null;
  current_entries: number;
  max_entries_per_user: number | null;
  settled: boolean;
  matches: { title: string; start_time: string; map_name: string | null; status: string } | null;
};
type Team = { id: string; name: string | null };

export default function TournamentDetails() {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, isAdmin } = useAuth();

  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [enteredRosterIds, setEnteredRosterIds] = useState<Set<string>>(new Set());
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const userId = session?.user.id;
    if (!id || !userId) return;

    const { data: t } = await supabase
      .from('tournaments')
      .select(
        'id, match_id, name, entry_fee, prize_pool, max_entries, current_entries, max_entries_per_user, settled, matches(title, start_time, map_name, status)'
      )
      .eq('id', id)
      .single();

    if (t) {
      setTournament(t as unknown as TournamentDetail);

      const [teamsRes, entryRes, walletRes] = await Promise.all([
        supabase.from('rosters').select('id, name').eq('user_id', userId).eq('match_id', t.match_id).order('created_at'),
        supabase.from('tournament_entries').select('roster_id').eq('user_id', userId).eq('tournament_id', id),
        supabase.from('wallets').select('balance').eq('user_id', userId).single(),
      ]);

      if (teamsRes.data) setTeams(teamsRes.data as Team[]);
      if (entryRes.data) setEnteredRosterIds(new Set(entryRes.data.map((e) => e.roster_id)));
      if (walletRes.data) setBalance(walletRes.data.balance);
    }
    setLoading(false);
  }, [id, session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleJoin = async (rosterId: string) => {
    if (!tournament) return;
    setJoiningId(rosterId);
    const { error } = await supabase.rpc('join_tournament', {
      p_tournament_id: tournament.id,
      p_roster_id: rosterId,
    });
    setJoiningId(null);
    if (error) {
      Alert.alert('Could not join', error.message); // friendly DB messages
      return;
    }
    Alert.alert('You’re in! 🎉', `Your team is entered in "${tournament.name}".`);
    load();
  };

  const handleDelete = async () => {
    if (!tournament) return;
    setDeleting(true);
    const { data, error } = await supabase.rpc('admin_delete_tournament', { p_tournament_id: tournament.id });
    setDeleting(false);
    if (error) {
      Alert.alert('Could not delete', error.message);
      return;
    }
    const refunded = Number(data ?? 0);
    Alert.alert('Contest deleted', refunded > 0 ? `Entry fees refunded to ${refunded} entry(ies).` : 'Contest removed.');
    router.back();
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete contest & refund?',
      'This removes the contest and refunds every entry fee to the players who joined. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete & Refund', style: 'destructive', onPress: handleDelete },
      ]
    );
  };

  if (loading || !tournament) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Contest" />
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      </View>
    );
  }

  const isFree = tournament.entry_fee === 0;
  const spotsLeft = tournament.max_entries != null ? tournament.max_entries - tournament.current_entries : null;
  const notEnough = balance != null && balance < tournament.entry_fee;
  const locked = !!tournament.matches && tournament.matches.status !== 'upcoming';
  const full = spotsLeft != null && spotsLeft <= 0;
  const enteredCount = enteredRosterIds.size;
  const capReached =
    tournament.max_entries_per_user != null && enteredCount >= tournament.max_entries_per_user;

  return (
    <View style={styles.container}>
      <ScreenHeader title={tournament.name} subtitle={tournament.matches?.title} />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}>
        {/* Prize / fee highlight card */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Prize Pool</Text>
          <Text style={styles.heroValue}>{isFree ? '—' : formatTokens(tournament.prize_pool)}</Text>
          <Text style={styles.heroUnit}>
            {isFree ? 'Practice contest (no prize)' : 'E-Tokens · total entry fees, grows as players join'}
          </Text>
        </View>

        {/* Stat rows */}
        <View style={styles.statsCard}>
          <StatRow icon="cash-outline" label="Entry Fee" value={isFree ? 'FREE' : `${formatTokens(tournament.entry_fee)} tokens`} />
          <Divider />
          <StatRow icon="people-outline" label="Joined" value={`${formatTokens(tournament.current_entries)}${tournament.max_entries != null ? ` / ${formatTokens(tournament.max_entries)}` : ''}`} />
          <Divider />
          <StatRow icon="ticket-outline" label="Spots Left" value={spotsLeft != null ? formatTokens(spotsLeft) : 'Unlimited'} />
          {tournament.max_entries_per_user != null ? (
            <>
              <Divider />
              <StatRow icon="person-outline" label="Max teams per user" value={String(tournament.max_entries_per_user)} />
            </>
          ) : null}
          {tournament.matches ? (
            <>
              <Divider />
              <StatRow icon="time-outline" label="Starts" value={formatMatchTime(tournament.matches.start_time)} />
            </>
          ) : null}
        </View>

        {/* Wallet line */}
        <View style={styles.walletRow}>
          <Ionicons name="wallet-outline" size={16} color={colors.textMuted} />
          <Text style={styles.walletText}>
            Your balance: <Text style={styles.walletValue}>{balance != null ? formatTokens(balance) : '—'} tokens</Text>
          </Text>
        </View>

        {/* Enter with your teams */}
        <Text style={styles.sectionTitle}>Enter with your teams</Text>

        {locked ? (
          <View style={styles.noticeRow}>
            <Ionicons name="lock-closed" size={18} color={colors.textMuted} />
            <Text style={styles.noticeText}>Entries closed — this match has started.</Text>
          </View>
        ) : teams.length === 0 ? (
          <View>
            <Text style={styles.helpText}>You need a team for this match before you can join.</Text>
            <Button label="Create your team first" onPress={() => router.push(`/team/${tournament.match_id}`)} />
          </View>
        ) : (
          <View>
            {tournament.max_entries_per_user != null ? (
              <Text style={styles.helpText}>
                You've entered {enteredCount} of {tournament.max_entries_per_user} allowed team(s).
              </Text>
            ) : null}

            {teams.map((team) => {
              const entered = enteredRosterIds.has(team.id);
              const blocked = notEnough || full || capReached;
              return (
                <View key={team.id} style={styles.teamRow}>
                  <Ionicons name="people" size={18} color={colors.primary} />
                  <Text style={styles.teamName} numberOfLines={1}>
                    {team.name ?? 'Team'}
                  </Text>
                  {entered ? (
                    <View style={styles.joinedPill}>
                      <Ionicons name="checkmark-circle" size={15} color={colors.success} />
                      <Text style={styles.joinedPillText}>Joined</Text>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => handleJoin(team.id)}
                      disabled={blocked || joiningId !== null}
                      style={({ pressed }) => [
                        styles.joinBtn,
                        (blocked || joiningId !== null) && { opacity: 0.4 },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      {joiningId === team.id ? (
                        <ActivityIndicator color={colors.bg} size="small" />
                      ) : (
                        <Text style={styles.joinBtnText}>{isFree ? 'Join FREE' : `Join · ${formatTokens(tournament.entry_fee)}`}</Text>
                      )}
                    </Pressable>
                  )}
                </View>
              );
            })}

            {/* Reasons a join is blocked */}
            {notEnough ? <Text style={styles.warn}>Not enough tokens for this entry fee.</Text> : null}
            {full ? <Text style={styles.warn}>This contest is full.</Text> : null}
            {capReached ? <Text style={styles.warn}>You've reached the max teams for this contest.</Text> : null}

            <Pressable onPress={() => router.push(`/team/${tournament.match_id}`)} style={styles.createMore}>
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.createMoreText}>Create another team</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.disclaimer}>
          E-Tokens are free virtual tokens for entertainment only, with no real-world value.
        </Text>

        {/* Admin-only: delete this contest and refund every entry fee */}
        {isAdmin && !tournament.settled ? (
          <Pressable
            onPress={confirmDelete}
            disabled={deleting}
            style={({ pressed }) => [styles.deleteBtn, (deleting || pressed) && { opacity: 0.7 }]}
          >
            {deleting ? (
              <ActivityIndicator color={colors.danger} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
                <Text style={styles.deleteText}>Delete contest & refund all</Text>
              </>
            )}
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return (
    <View style={styles.statRow}>
      <View style={styles.statLeft}>
        <Ionicons name={icon} size={18} color={colors.textMuted} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function Divider() {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return <View style={styles.divider} />;
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  hero: { ...shadow, backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center' },
  heroLabel: { color: colors.onPrimaryMuted, fontWeight: '700', fontSize: font.md },
  heroValue: { color: colors.onPrimary, fontWeight: '900', fontSize: 44, marginTop: 4 },
  heroUnit: { color: colors.onPrimaryMuted, fontWeight: '700', fontSize: font.sm },

  statsCard: {
    ...shadow,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
  statLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statLabel: { color: colors.textMuted, fontSize: font.md },
  statValue: { color: colors.text, fontSize: font.md, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border },

  walletRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.lg },
  walletText: { color: colors.textMuted, fontSize: font.md },
  walletValue: { color: colors.text, fontWeight: '700' },

  sectionTitle: { color: colors.text, fontSize: font.lg, fontWeight: '800', marginTop: spacing.xl, marginBottom: spacing.md },
  helpText: { color: colors.textMuted, fontSize: font.sm, marginBottom: spacing.md, lineHeight: 18 },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  noticeText: { color: colors.textMuted, fontSize: font.md, fontWeight: '600' },

  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  teamName: { flex: 1, color: colors.text, fontSize: font.md, fontWeight: '600' },
  joinBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    minWidth: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: { color: colors.bg, fontWeight: '800', fontSize: font.sm },
  joinedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm },
  joinedPillText: { color: colors.success, fontWeight: '800', fontSize: font.sm },

  warn: { color: colors.danger, fontSize: font.sm, marginTop: spacing.xs, marginBottom: spacing.xs },
  createMore: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm, paddingVertical: spacing.sm },
  createMoreText: { color: colors.primary, fontSize: font.md, fontWeight: '700' },

  disclaimer: { color: colors.textFaint, fontSize: font.sm - 1, lineHeight: 18, marginTop: spacing.lg },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  deleteText: { color: colors.danger, fontSize: font.md, fontWeight: '700' },
});

