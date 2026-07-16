// ============================================================================
//  components/GameToggle.tsx
//  The BGMI / Valorant switch at the top of the Home screen.
// ============================================================================
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../constants/theme';

export type Game = 'BGMI' | 'Valorant';

type Props = {
  value: Game;
  onChange: (game: Game) => void;
};

export default function GameToggle({ value, onChange }: Props) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return (
    <View style={styles.wrap}>
      {(['BGMI', 'Valorant'] as Game[]).map((game) => {
        const active = value === game;
        return (
          <Pressable
            key={game}
            onPress={() => onChange(game)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{game}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) =>
  StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary },
  label: { color: colors.textMuted, fontWeight: '700', fontSize: font.md },
  labelActive: { color: colors.bg },
});
