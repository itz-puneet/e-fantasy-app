// ============================================================================
//  components/StatusPill.tsx
//  Small coloured pill showing a match status: LIVE / COMPLETED / UPCOMING.
//  Shared by the My Contests cards and the Leaderboard header.
// ============================================================================
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../constants/theme';
import LiveDot from './LiveDot';

export default function StatusPill({ status }: { status: string }) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  if (status === 'live') {
    return (
      <View style={[styles.pill, { backgroundColor: 'rgba(255,59,48,0.15)' }]}>
        <LiveDot color={colors.live} />
        <Text style={[styles.text, { color: colors.live }]}>LIVE</Text>
      </View>
    );
  }
  if (status === 'completed') {
    return (
      <View style={[styles.pill, { backgroundColor: colors.cardAlt }]}>
        <Text style={[styles.text, { color: colors.textMuted }]}>COMPLETED</Text>
      </View>
    );
  }
  return (
    <View style={[styles.pill, { backgroundColor: 'rgba(124,77,255,0.15)' }]}>
      <Text style={[styles.text, { color: colors.accent }]}>UPCOMING</Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) =>
  StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  text: { fontWeight: '800', fontSize: font.sm - 2, letterSpacing: 0.5 },
});
