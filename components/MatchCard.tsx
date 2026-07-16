// ============================================================================
//  components/MatchCard.tsx
//  A single BGMI match row on the Home screen.
// ============================================================================
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../constants/theme';
import { formatMatchTime } from '../lib/format';
import LiveDot from './LiveDot';

export type Match = {
  id: string;
  game: string;
  title: string;
  map_name: string | null;
  start_time: string;
  status: string; // 'upcoming' | 'live' | 'completed'
};

// onPress is optional: when provided, the whole card becomes tappable and a
// chevron (>) appears to hint that it opens the match details.
export default function MatchCard({
  match,
  onPress,
}: {
  match: Match;
  onPress?: () => void;
}) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, pressed && onPress ? styles.pressed : null]}
    >
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{match.game}</Text>
        </View>
        <StatusPill status={match.status} />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>{match.title}</Text>
        {onPress ? (
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        ) : null}
      </View>

      <View style={styles.metaRow}>
        {match.map_name ? (
          <View style={styles.meta}>
            <Ionicons name="map-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>{match.map_name}</Text>
          </View>
        ) : null}
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{formatMatchTime(match.start_time)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function StatusPill({ status }: { status: string }) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  if (status === 'live') {
    return (
      <View style={[styles.pill, { backgroundColor: 'rgba(255,77,77,0.16)' }]}>
        <LiveDot color={colors.live} />
        <Text style={[styles.pillText, { color: colors.live }]}>LIVE</Text>
      </View>
    );
  }
  if (status === 'completed') {
    return (
      <View style={[styles.pill, { backgroundColor: colors.cardAlt }]}>
        <Text style={[styles.pillText, { color: colors.textMuted }]}>COMPLETED</Text>
      </View>
    );
  }
  return (
    <View style={[styles.pill, { backgroundColor: 'rgba(139,92,246,0.16)' }]}>
      <Text style={[styles.pillText, { color: colors.accent }]}>UPCOMING</Text>
    </View>
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
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    badge: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.sm,
    },
    badgeText: { color: colors.onPrimary, fontWeight: '800', fontSize: font.sm - 1 },
    pressed: { opacity: 0.7 },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    title: { color: colors.text, fontSize: font.lg, fontWeight: '700', flex: 1 },
    metaRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
    meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { color: colors.textMuted, fontSize: font.sm },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.pill,
    },
    pillText: { fontWeight: '800', fontSize: font.sm - 2, letterSpacing: 0.5 },
  });
