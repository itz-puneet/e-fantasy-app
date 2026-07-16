// ============================================================================
//  components/TournamentCard.tsx
//  One tournament (contest) row shown on the Match Details screen.
// ============================================================================
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../constants/theme';
import { formatTokens } from '../lib/format';

export type Tournament = {
  id: string;
  match_id: string;
  name: string;
  entry_fee: number;
  prize_pool: number;
  max_entries: number | null;
  current_entries: number;
};

export default function TournamentCard({
  tournament,
  joined,
  onPress,
}: {
  tournament: Tournament;
  joined?: boolean;
  onPress: () => void;
}) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const { name, entry_fee, prize_pool, max_entries, current_entries } = tournament;
  const spotsLeft = max_entries != null ? max_entries - current_entries : null;
  const isFree = entry_fee === 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {joined ? (
          <View style={styles.joinedPill}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text style={styles.joinedText}>JOINED</Text>
          </View>
        ) : null}
      </View>

      {isFree ? (
        <Text style={styles.prize}>Practice contest • just for fun</Text>
      ) : (
        <Text style={styles.prize}>
          Prize Pool: <Text style={styles.prizeValue}>{formatTokens(prize_pool)} tokens</Text>
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.feeChip}>
          <Ionicons name="cash-outline" size={15} color={colors.bg} />
          <Text style={styles.feeText}>{isFree ? 'FREE' : `${formatTokens(entry_fee)} tokens`}</Text>
        </View>
        <Text style={styles.spots}>
          {spotsLeft != null ? `${formatTokens(spotsLeft)} spots left` : 'Unlimited spots'}
        </Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: { color: colors.text, fontSize: font.lg, fontWeight: '700', flex: 1 },
  joinedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(46,204,113,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  joinedText: { color: colors.success, fontWeight: '800', fontSize: font.sm - 2 },
  prize: { color: colors.textMuted, fontSize: font.sm, marginTop: spacing.xs },
  prizeValue: { color: colors.primary, fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  feeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  feeText: { color: colors.bg, fontWeight: '800', fontSize: font.sm },
  spots: { color: colors.textFaint, fontSize: font.sm },
});
