// ============================================================================
//  app/team/[matchId].tsx  ->  CREATE / EDIT TEAM  (the roster builder)
//  Rules enforced here AND in the database (save_roster):
//    * exactly 12 players
//    * pick 1 Esports Team
//    * pick 1 Captain (2x points) and 1 Vice-Captain (1.5x points)
//  The team is saved at the MATCH level, so it can be reused for every contest
//  under this match.
// ============================================================================
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Field from '../../components/Field';
import ScreenHeader from '../../components/ScreenHeader';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

const REQUIRED_PLAYERS = 12;

type Player = { id: string; name: string; teamName: string | null };
type EsportsTeam = { id: string; name: string };

export default function TeamBuilder() {
  // matchId = which match; rosterId present = editing that team, absent = new team.
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const { matchId, rosterId } = useLocalSearchParams<{ matchId: string; rosterId?: string }>();
  const isEdit = !!rosterId;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  const screenTitle = isEdit ? 'Edit Team' : 'Create Team';

  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<EsportsTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(false); // true if the match has started

  // The user's choices:
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [viceId, setViceId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const userId = session?.user.id;
      if (!matchId || !userId) return;

      // Which game is this match? (players/teams are filtered by game)
      const { data: match } = await supabase.from('matches').select('game, status').eq('id', matchId).single();
      const game = match?.game ?? 'BGMI';
      // Lock if the match has started OR doesn't exist (deleted / bad link),
      // so the user never builds a roster that can't be saved.
      if (!match || match.status !== 'upcoming') {
        setLocked(true);
        setLoading(false);
        return;
      }

      const [playersRes, teamsRes] = await Promise.all([
        supabase.from('players').select('id, name, esports_teams(name)').eq('game', game).order('name'),
        supabase.from('esports_teams').select('id, name').eq('game', game).order('name'),
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
      if (teamsRes.data) setTeams(teamsRes.data as EsportsTeam[]);

      // Edit mode: load THIS specific team (by id) and pre-fill it.
      if (rosterId) {
        const { data: r } = await supabase
          .from('rosters')
          .select('team_id, name, roster_players(player_id, is_captain, is_vice_captain)')
          .eq('id', rosterId)
          .eq('user_id', userId)
          .maybeSingle();
        if (r) {
          setTeamId(r.team_id);
          setName(r.name ?? '');
          const rp = (r.roster_players ?? []) as {
            player_id: string;
            is_captain: boolean;
            is_vice_captain: boolean;
          }[];
          setSelected(new Set(rp.map((x) => x.player_id)));
          setCaptainId(rp.find((x) => x.is_captain)?.player_id ?? null);
          setViceId(rp.find((x) => x.is_vice_captain)?.player_id ?? null);
        }
      }
      setLoading(false);
    };
    load();
  }, [matchId, rosterId, session]);

  const togglePlayer = (pid: string) => {
    if (selected.has(pid)) {
      const next = new Set(selected);
      next.delete(pid);
      setSelected(next);
      if (captainId === pid) setCaptainId(null);
      if (viceId === pid) setViceId(null);
    } else {
      if (selected.size >= REQUIRED_PLAYERS) {
        Alert.alert('Team full', `You can only pick ${REQUIRED_PLAYERS} players. Remove one first.`);
        return;
      }
      const next = new Set(selected);
      next.add(pid);
      setSelected(next);
    }
  };

  const makeCaptain = (pid: string) => {
    setCaptainId((prev) => (prev === pid ? null : pid));
    setViceId((prev) => (prev === pid ? null : prev)); // can't be Captain AND Vice
  };

  const makeVice = (pid: string) => {
    setViceId((prev) => (prev === pid ? null : pid));
    setCaptainId((prev) => (prev === pid ? null : prev));
  };

  const canSave =
    selected.size === REQUIRED_PLAYERS && !!captainId && !!viceId && !!teamId;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const { error } = await supabase.rpc('save_roster', {
      p_roster_id: rosterId ?? null, // null = create a new team
      p_match_id: matchId,
      p_team_id: teamId,
      p_player_ids: Array.from(selected),
      p_captain_id: captainId,
      p_vice_captain_id: viceId,
      p_name: name.trim() || null,
    });
    setSaving(false);

    if (error) {
      Alert.alert('Could not save team', error.message);
      return;
    }
    Alert.alert(
      isEdit ? 'Team updated ✅' : 'Team saved! ✅',
      'Your team is ready. You can enter it into contests for this match.'
    );
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title={screenTitle} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      </View>
    );
  }

  if (locked) {
    return (
      <View style={styles.container}>
        <ScreenHeader title={screenTitle} />
        <View style={styles.lockedWrap}>
          <Ionicons name="lock-closed" size={52} color={colors.textFaint} />
          <Text style={styles.lockedTitle}>Teams are locked</Text>
          <Text style={styles.lockedText}>
            This match is closed for team building — it may have already started or is no
            longer available.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={screenTitle} subtitle={`Pick ${REQUIRED_PLAYERS} players + 1 team`} />

      <FlatList
        data={players}
        keyExtractor={(p) => p.id}
        extraData={{ selected, captainId, viceId, teamId }}
        renderItem={({ item }) => (
          <PlayerRow
            player={item}
            selected={selected.has(item.id)}
            isCaptain={captainId === item.id}
            isVice={viceId === item.id}
            onToggle={() => togglePlayer(item.id)}
            onCaptain={() => makeCaptain(item.id)}
            onVice={() => makeVice(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListHeaderComponent={
          <View>
            {/* Optional team name */}
            <Field
              label="Team name (optional)"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Team 1"
              autoCapitalize="none"
            />
            <View style={{ height: spacing.lg }} />

            {/* Esports team picker */}
            <Text style={styles.sectionTitle}>1. Pick your Esports Team</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xs }}
            >
              {teams.map((t) => {
                const active = teamId === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => setTeamId(t.id)}
                    style={[styles.teamChip, active && styles.teamChipActive]}
                  >
                    <Text style={[styles.teamChipText, active && styles.teamChipTextActive]}>
                      {t.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Players header + counter */}
            <View style={styles.playersHeader}>
              <Text style={styles.sectionTitle}>2. Pick 12 Players</Text>
              <Text style={[styles.counter, selected.size === REQUIRED_PLAYERS && { color: colors.success }]}>
                {selected.size}/{REQUIRED_PLAYERS}
              </Text>
            </View>
            <Text style={styles.hint}>
              Tap a player to add them. Then tap <Text style={styles.cHint}>C</Text> for Captain (2x)
              and <Text style={styles.vcHint}>VC</Text> for Vice-Captain (1.5x).
            </Text>
          </View>
        }
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + 130,
        }}
      />

      {/* Sticky Save bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.summary}>
          <Summary label="Players" ok={selected.size === REQUIRED_PLAYERS} text={`${selected.size}/12`} />
          <Summary label="Team" ok={!!teamId} text={teamId ? '✓' : '—'} />
          <Summary label="C" ok={!!captainId} text={captainId ? '✓' : '—'} />
          <Summary label="VC" ok={!!viceId} text={viceId ? '✓' : '—'} />
        </View>
        <Button label={isEdit ? 'Save Changes' : 'Save Team'} onPress={handleSave} loading={saving} disabled={!canSave} />
      </View>
    </View>
  );
}

// ---- One player row ---------------------------------------------------------
function PlayerRow({
  player,
  selected,
  isCaptain,
  isVice,
  onToggle,
  onCaptain,
  onVice,
}: {
  player: Player;
  selected: boolean;
  isCaptain: boolean;
  isVice: boolean;
  onToggle: () => void;
  onCaptain: () => void;
  onVice: () => void;
}) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return (
    <Pressable
      onPress={onToggle}
      style={[styles.playerRow, selected && styles.playerRowActive]}
    >
      {/* Selection tick */}
      <View style={[styles.check, selected && styles.checkOn]}>
        {selected ? <Ionicons name="checkmark" size={16} color={colors.bg} /> : null}
      </View>

      {/* Name + team */}
      <View style={{ flex: 1 }}>
        <Text style={styles.playerName}>{player.name}</Text>
        {player.teamName ? <Text style={styles.playerTeam}>{player.teamName}</Text> : null}
      </View>

      {/* Captain / Vice buttons (only when selected) */}
      {selected ? (
        <View style={styles.roleBtns}>
          <RoleButton label="C" active={isCaptain} color={colors.primary} onPress={onCaptain} />
          <RoleButton label="VC" active={isVice} color={colors.accent} onPress={onVice} />
        </View>
      ) : null}
    </Pressable>
  );
}

function RoleButton({
  label,
  active,
  color,
  onPress,
}: {
  label: string;
  active: boolean;
  color: string;
  onPress: () => void;
}) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.roleBtn,
        { borderColor: color },
        active && { backgroundColor: color },
      ]}
    >
      <Text style={[styles.roleText, { color: active ? colors.bg : color }]}>{label}</Text>
    </Pressable>
  );
}

function Summary({ label, ok, text }: { label: string; ok: boolean; text: string }) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color: ok ? colors.success : colors.textMuted }]}>{text}</Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  lockedWrap: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, marginTop: spacing.xl * 2, gap: spacing.sm },
  lockedTitle: { color: colors.text, fontSize: font.xl, fontWeight: '800', marginTop: spacing.sm },
  lockedText: { color: colors.textMuted, fontSize: font.md, textAlign: 'center', lineHeight: 22 },
  sectionTitle: { color: colors.text, fontSize: font.lg, fontWeight: '800', marginBottom: spacing.md },
  teamChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  teamChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  teamChipText: { color: colors.textMuted, fontWeight: '700', fontSize: font.md },
  teamChipTextActive: { color: colors.bg },

  playersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  counter: { color: colors.textMuted, fontSize: font.lg, fontWeight: '800', marginBottom: spacing.md },
  hint: { color: colors.textMuted, fontSize: font.sm, lineHeight: 19, marginBottom: spacing.md },
  cHint: { color: colors.primary, fontWeight: '800' },
  vcHint: { color: colors.accent, fontWeight: '800' },

  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  playerRowActive: { borderColor: colors.primary },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  playerName: { color: colors.text, fontSize: font.md, fontWeight: '700' },
  playerTeam: { color: colors.textMuted, fontSize: font.sm, marginTop: 1 },
  roleBtns: { flexDirection: 'row', gap: spacing.sm },
  roleBtn: {
    minWidth: 38,
    height: 34,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  roleText: { fontWeight: '800', fontSize: font.sm },

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
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { color: colors.textFaint, fontSize: font.sm - 1, fontWeight: '600' },
  summaryValue: { fontSize: font.md, fontWeight: '800', marginTop: 2 },
});
