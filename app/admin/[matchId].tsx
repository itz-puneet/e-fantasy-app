// ============================================================================
//  app/admin/[matchId].tsx  ->  ADMIN SCORING SCREEN
//  Quick-tap buttons to record each player's Kill / Knock / Self-Knock. Every
//  tap calls admin_add_event(), which writes to match_player_stats -> that
//  instantly feeds the leaderboards. A "Finish Match & Pay Winners" button
//  calls finalize_match() to rank everyone and pay prize tokens.
// ============================================================================
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import StatusPill from '../../components/StatusPill';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';
import { formatPoints } from '../../lib/format';
import { supabase } from '../../lib/supabase';

type Player = { id: string; name: string; teamName: string | null };
type Stat = { kills: number; knocks: number; self_knocks: number };
type Rules = { points_per_kill: number; points_per_knock: number; self_knock_penalty: number };

const EMPTY: Stat = { kills: 0, knocks: 0, self_knocks: 0 };
const DEFAULT_RULES: Rules = { points_per_kill: 5, points_per_knock: 5, self_knock_penalty: -5 };

export default function AdminScoring() {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();

  const [title, setTitle] = useState('Match');
  const [status, setStatus] = useState('upcoming');
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<Record<string, Stat>>({});
  const [rules, setRules] = useState<Rules>(DEFAULT_RULES);
  const [mode, setMode] = useState<'add' | 'undo'>('add');
  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState(false);
  const [settingLive, setSettingLive] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!matchId || !isAdmin) return;

      const { data: match } = await supabase
        .from('matches')
        .select('title, status, game')
        .eq('id', matchId)
        .single();
      if (match) {
        setTitle(match.title);
        setStatus(match.status);
      }
      const game = match?.game ?? 'BGMI';

      const [playersRes, statsRes, rulesRes] = await Promise.all([
        supabase.from('players').select('id, name, esports_teams(name)').eq('game', game).order('name'),
        supabase.from('match_player_stats').select('player_id, kills, knocks, self_knocks').eq('match_id', matchId),
        supabase.from('scoring_rules').select('points_per_kill, points_per_knock, self_knock_penalty').eq('id', 1).single(),
      ]);

      if (playersRes.data) {
        setPlayers(
          playersRes.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            teamName: p.esports_teams?.name ?? null,
          }))
        );
      }
      if (statsRes.data) {
        const map: Record<string, Stat> = {};
        for (const s of statsRes.data as any[]) {
          map[s.player_id] = { kills: s.kills, knocks: s.knocks, self_knocks: s.self_knocks };
        }
        setStats(map);
      }
      if (rulesRes.data) setRules(rulesRes.data as Rules);
      setLoading(false);
    };
    load();
  }, [matchId, isAdmin]);

  // Match lifecycle: upcoming -> live -> completed.
  const isCompleted = status === 'completed';
  const isUpcoming = status === 'upcoming';

  const doSetLive = async () => {
    setSettingLive(true);
    const { error } = await supabase.rpc('admin_set_match_live', { p_match_id: matchId });
    setSettingLive(false);
    if (error) {
      Alert.alert('Could not set live', error.message);
      return;
    }
    setStatus('live');
    Alert.alert('Match is LIVE', 'Entries are now closed. Score players, then finish & pay winners.');
  };

  const confirmSetLive = () => {
    Alert.alert(
      'Set match LIVE?',
      'This closes entries — players can no longer join contests or edit teams for this match. Do this when the match starts.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Set Live', onPress: doSetLive },
      ]
    );
  };

  const pointsFor = (s: Stat) =>
    s.kills * rules.points_per_kill +
    s.knocks * rules.points_per_knock +
    s.self_knocks * rules.self_knock_penalty;

  const addEvent = async (playerId: string, field: keyof Stat) => {
    if (isCompleted) return;
    const delta = mode === 'add' ? 1 : -1;
    const { data, error } = await supabase.rpc('admin_add_event', {
      p_match_id: matchId,
      p_player_id: playerId,
      p_field: field,
      p_delta: delta,
    });
    if (error) {
      Alert.alert('Could not save', error.message);
      return;
    }
    const row = (data as any[])?.[0];
    if (row) {
      setStats((prev) => ({
        ...prev,
        [playerId]: { kills: row.kills, knocks: row.knocks, self_knocks: row.self_knocks },
      }));
    }
  };

  const doFinalize = async () => {
    setFinalizing(true);
    const { data, error } = await supabase.rpc('finalize_match', { p_match_id: matchId });
    setFinalizing(false);
    if (error) {
      Alert.alert('Could not finalize', error.message);
      return;
    }
    const rows = (data as any[]) ?? [];
    const total = rows.reduce((sum, r) => sum + Number(r.award), 0);
    const receipt = rows.length
      ? rows.map((r) => `#${r.rank} ${r.username} → +${r.award} (${r.tournament_name})`).join('\n')
      : 'No prizes were due (free contests, or no one has scored yet).';
    setStatus('completed');
    Alert.alert(
      'Match finished ✅',
      `${rows.length} payout(s) • ${total} tokens distributed.\n\n${receipt}`
    );
  };

  const confirmFinalize = () => {
    Alert.alert(
      'Finish match & pay winners?',
      'This marks the match COMPLETED, freezes final points, and pays prize tokens to the top players in each contest. Make sure all stats are entered — contests are paid only once.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Finish & Pay', style: 'destructive', onPress: doFinalize },
      ]
    );
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Admin" />
        <Text style={styles.denied}>You don't have admin access.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={title} subtitle="Tap to score players" />

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={players}
          keyExtractor={(p) => p.id}
          extraData={{ stats, mode, isCompleted }}
          renderItem={({ item }) => {
            const s = stats[item.id] ?? EMPTY;
            return (
              <View style={styles.playerRow}>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{item.name}</Text>
                  <Text style={styles.playerMeta}>
                    {item.teamName ? `${item.teamName} • ` : ''}K {s.kills} · Kn {s.knocks} · SK{' '}
                    {s.self_knocks} • <Text style={styles.pts}>{formatPoints(pointsFor(s))} pts</Text>
                  </Text>
                </View>
                <View style={styles.eventBtns}>
                  <EventButton label="Kill" color={colors.primary} disabled={isCompleted} onPress={() => addEvent(item.id, 'kills')} />
                  <EventButton label="Knock" color={colors.accent} disabled={isCompleted} onPress={() => addEvent(item.id, 'knocks')} />
                  <EventButton label="Self" color={colors.danger} disabled={isCompleted} onPress={() => addEvent(item.id, 'self_knocks')} />
                </View>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListHeaderComponent={
            <View>
              <View style={styles.topRow}>
                <StatusPill status={status} />
                {!isCompleted ? (
                  <View style={styles.modeToggle}>
                    <ModeBtn label="+ Add" active={mode === 'add'} onPress={() => setMode('add')} />
                    <ModeBtn label="− Undo" active={mode === 'undo'} onPress={() => setMode('undo')} />
                  </View>
                ) : null}
              </View>
              <Text style={styles.hint}>
                {isCompleted
                  ? 'This match is finalized — scoring is locked and results are final.'
                  : mode === 'add'
                  ? 'Tap Kill / Knock / Self to add +1. Points feed the leaderboards instantly.'
                  : 'UNDO mode: tapping now subtracts 1 (for mis-taps).'}
              </Text>
              {isUpcoming ? (
                <Text style={styles.hint}>
                  Entries are still open. Tap “Set Match Live” below when the match starts to close them.
                </Text>
              ) : null}
            </View>
          }
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: insets.bottom + 100,
          }}
        />
      )}

      {/* Sticky finalize bar */}
      {!loading ? (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
          {isCompleted ? (
            <View style={styles.completedBox}>
              <Ionicons name="checkmark-done-circle" size={20} color={colors.success} />
              <Text style={styles.completedText}>Match completed — results are final</Text>
            </View>
          ) : isUpcoming ? (
            <Button label="Set Match Live" onPress={confirmSetLive} loading={settingLive} />
          ) : (
            <Button label="Finish Match & Pay Winners" onPress={confirmFinalize} loading={finalizing} />
          )}
        </View>
      ) : null}
    </View>
  );
}

function EventButton({
  label,
  color,
  onPress,
  disabled,
}: {
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.eventBtn,
        { borderColor: color },
        disabled && { opacity: 0.35 },
        pressed && !disabled && { backgroundColor: color },
      ]}
    >
      <Text style={[styles.eventBtnText, { color }]}>{label}</Text>
    </Pressable>
  );
}

function ModeBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return (
    <Pressable onPress={onPress} style={[styles.modeBtn, active && styles.modeBtnActive]}>
      <Text style={[styles.modeText, active && styles.modeTextActive]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  denied: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  modeToggle: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.pill, padding: 3, gap: 3 },
  modeBtn: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill },
  modeBtnActive: { backgroundColor: colors.cardAlt },
  modeText: { color: colors.textMuted, fontWeight: '700', fontSize: font.sm },
  modeTextActive: { color: colors.text },
  hint: { color: colors.textMuted, fontSize: font.sm, marginBottom: spacing.lg, lineHeight: 18 },

  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  playerInfo: { flex: 1 },
  playerName: { color: colors.text, fontSize: font.md, fontWeight: '700' },
  playerMeta: { color: colors.textMuted, fontSize: font.sm - 1, marginTop: 3 },
  pts: { color: colors.primary, fontWeight: '700' },

  eventBtns: { flexDirection: 'row', gap: 6 },
  eventBtn: {
    minWidth: 46,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  eventBtnText: { fontWeight: '800', fontSize: font.sm - 1 },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  completedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
  },
  completedText: { color: colors.success, fontSize: font.md, fontWeight: '700' },
});
