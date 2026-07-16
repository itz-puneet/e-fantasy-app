// ============================================================================
//  components/ContestCard.tsx
//  A contest the user has JOINED, shown on the My Contests screen.
//  Tapping it opens the leaderboard.
// ============================================================================
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../constants/theme';
import { formatMatchTime, formatTokens } from '../lib/format';
import StatusPill from './StatusPill';

export type JoinedContest = {
  entryId: string;
  tournamentId: string;
  name: string;
  teamName: string;
  entryFee: number;
  prizePool: number;
  matchTitle: string;
  matchStatus: string;
  startTime: string;
};

export default function ContestCard({
  contest,
  onPress,
}: {
  contest: JoinedContest;
  onPress: () => void;
}) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <Text style={styles.match} numberOfLines={1}>
          {contest.matchTitle}
        </Text>
        <StatusPill status={contest.matchStatus} />
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {contest.name}
      </Text>
      <View style={styles.teamLine}>
        <Ionicons name="people" size={13} color={colors.primary} />
        <Text style={styles.team} numberOfLines={1}>{contest.teamName}</Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{formatMatchTime(contest.startTime)}</Text>
        </View>
        {contest.prizePool > 0 ? (
          <View style={styles.meta}>
            <Ionicons name="trophy-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>{formatTokens(contest.prizePool)} prize</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.entry}>
          Entry paid: {contest.entryFee === 0 ? 'FREE' : `${formatTokens(contest.entryFee)} tokens`}
        </Text>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>Leaderboard</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) =>
  StyleSheet.create({
  card: {
    ...shadow,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  match: { color: colors.textMuted, fontSize: font.sm, fontWeight: '600', flex: 1 },
  name: { color: colors.text, fontSize: font.lg, fontWeight: '700', marginTop: spacing.xs },
  teamLine: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  team: { color: colors.primary, fontSize: font.sm, fontWeight: '600' },
  metaRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: colors.textMuted, fontSize: font.sm },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  entry: { color: colors.textFaint, fontSize: font.sm },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ctaText: { color: colors.primary, fontSize: font.sm, fontWeight: '700' },
});
