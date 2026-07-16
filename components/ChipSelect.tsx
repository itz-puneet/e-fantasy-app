// ============================================================================
//  components/ChipSelect.tsx
//  A labelled horizontal row of selectable pills (single choice). Used on the
//  admin create-forms to pick a game, status, team, match, etc.
// ============================================================================
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../constants/theme';

export type ChipOption = { label: string; value: string | null };

export default function ChipSelect({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: ChipOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <Pressable
              key={String(opt.value)}
              onPress={() => onChange(opt.value)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) =>
  StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { color: colors.textMuted, fontSize: font.sm, fontWeight: '600' },
  row: { gap: spacing.sm, paddingVertical: 2 },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontWeight: '700', fontSize: font.md },
  chipTextActive: { color: colors.bg },
});
