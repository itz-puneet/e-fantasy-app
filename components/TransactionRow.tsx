// ============================================================================
//  components/TransactionRow.tsx
//  One line in the wallet's Transaction History.
// ============================================================================
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../constants/theme';
import { formatDateTime, formatTokens } from '../lib/format';

export type Transaction = {
  id: string;
  amount: number; // + for credit, - for debit
  type: string;
  description: string | null;
  created_at: string;
};

export default function TransactionRow({ tx }: { tx: Transaction }) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const isCredit = tx.amount >= 0;

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: isCredit ? 'rgba(46,204,113,0.15)' : 'rgba(255,90,95,0.15)' },
        ]}
      >
        <Ionicons
          name={isCredit ? 'arrow-down' : 'arrow-up'}
          size={18}
          color={isCredit ? colors.success : colors.danger}
        />
      </View>

      <View style={styles.middle}>
        <Text style={styles.desc} numberOfLines={1}>
          {tx.description ?? tx.type}
        </Text>
        <Text style={styles.date}>{formatDateTime(tx.created_at)}</Text>
      </View>

      <Text style={[styles.amount, { color: isCredit ? colors.success : colors.danger }]}>
        {isCredit ? '+' : '-'}
        {formatTokens(Math.abs(tx.amount))}
      </Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) =>
  StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md - 2,
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: { flex: 1 },
  desc: { color: colors.text, fontSize: font.md, fontWeight: '600' },
  date: { color: colors.textFaint, fontSize: font.sm - 1, marginTop: 2 },
  amount: { fontSize: font.md, fontWeight: '800' },
});
