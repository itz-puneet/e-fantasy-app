// ============================================================================
//  components/RankRow.tsx
//  One row on the leaderboard: rank + username + points. The top 3 get medal
//  colours, and the current user's row is highlighted with a "YOU" tag.
// ============================================================================
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../constants/theme';
import { formatPoints } from '../lib/format';

export type LeaderboardEntry = {
  rank: number;
  roster_id: string;
  user_id: string;
  username: string;
  team_name: string;
  points: number | string;
  is_you: boolean;
};

const MEDALS: Record<number, string> = {
  1: '#F5C518', // gold
  2: '#C0C8D4', // silver
  3: '#CD7F32', // bronze
};

export default function RankRow({ entry }: { entry: LeaderboardEntry }) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const medal = MEDALS[entry.rank];

  return (
    <View style={[styles.row, entry.is_you && styles.rowYou]}>
      {/* Rank badge */}
      <View style={[styles.rankBadge, medal ? { backgroundColor: medal } : null]}>
        {/* Medal colours are fixed & light in both themes, so medal text stays dark. */}
        <Text style={[styles.rankText, medal ? styles.rankTextMedal : null]}>{entry.rank}</Text>
      </View>

      {/* Name + team */}
      <View style={styles.nameWrap}>
        <View style={styles.nameLine}>
          <Text style={styles.name} numberOfLines={1}>
            {entry.username}
          </Text>
          {entry.is_you ? (
            <View style={styles.youTag}>
              <Text style={styles.youText}>YOU</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.team} numberOfLines={1}>
          {entry.team_name}
        </Text>
      </View>

      {/* Points */}
      <View style={styles.pointsWrap}>
        <Text style={styles.points}>{formatPoints(entry.points)}</Text>
        <Text style={styles.pointsLabel}>pts</Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) =>
  StyleSheet.create({
    row: {
      ...shadow,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.md,
    },
    rowYou: { borderColor: colors.primary, backgroundColor: 'rgba(31,203,107,0.12)' },
    rankBadge: {
      minWidth: 32,
      height: 32,
      borderRadius: radius.pill,
      backgroundColor: colors.cardAlt,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    rankText: { color: colors.text, fontWeight: '800', fontSize: font.md },
    rankTextMedal: { color: '#14171C' },
    nameWrap: { flex: 1 },
    nameLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    name: { color: colors.text, fontSize: font.md, fontWeight: '600', flexShrink: 1 },
    team: { color: colors.textMuted, fontSize: font.sm - 1, marginTop: 1 },
    youTag: {
      backgroundColor: colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: radius.sm,
    },
    youText: { color: colors.onPrimary, fontWeight: '800', fontSize: font.sm - 3 },
    pointsWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
    points: { color: colors.primary, fontWeight: '800', fontSize: font.lg },
    pointsLabel: { color: colors.textMuted, fontSize: font.sm - 1 },
  });
