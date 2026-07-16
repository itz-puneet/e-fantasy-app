// ============================================================================
//  app/(tabs)/wallet.tsx  ->  WALLET SCREEN
//  Shows the Total Token Balance, and a "Transaction History" tab.
// ============================================================================
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TransactionRow, { type Transaction } from '../../components/TransactionRow';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';
import { formatTokens } from '../../lib/format';
import { supabase } from '../../lib/supabase';

type Tab = 'overview' | 'history';

export default function Wallet() {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  const [tab, setTab] = useState<Tab>('overview');
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWallet = useCallback(async () => {
    const userId = session?.user.id;
    if (!userId) return;

    // Fetch balance + transaction history at the same time.
    const [walletRes, txRes] = await Promise.all([
      supabase.from('wallets').select('balance').eq('user_id', userId).single(),
      supabase
        .from('transactions')
        .select('id, amount, type, description, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ]);

    if (walletRes.data) setBalance(walletRes.data.balance);
    if (txRes.data) setTransactions(txRes.data as Transaction[]);
    setLoading(false);
    setRefreshing(false);
  }, [session]);

  // Refresh balance + history each time the tab is focused, so tokens spent
  // (joining a contest) and won (prizes) appear immediately.
  useFocusEffect(
    useCallback(() => {
      loadWallet();
    }, [loadWallet])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadWallet();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      {/* Header */}
      <Text style={styles.heading}>Wallet</Text>

      {/* Balance card (always visible) */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Token Balance</Text>
        {balance === null ? (
          <ActivityIndicator color={colors.onPrimary} style={{ marginTop: spacing.sm }} />
        ) : (
          <View style={styles.balanceRow}>
            <Ionicons name="cash" size={30} color={colors.onPrimary} />
            <Text style={styles.balanceValue}>{formatTokens(balance)}</Text>
            <Text style={styles.balanceUnit}>E-Tokens</Text>
          </View>
        )}
      </View>

      {/* Sub-tabs: Overview / History */}
      <View style={styles.segment}>
        <SegmentButton label="Overview" active={tab === 'overview'} onPress={() => setTab('overview')} />
        <SegmentButton label="History" active={tab === 'history'} onPress={() => setTab('history')} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : tab === 'overview' ? (
        <Overview txCount={transactions.length} />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => <TransactionRow tx={item} />}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={<Text style={styles.empty}>No transactions yet.</Text>}
        />
      )}
    </View>
  );
}

function Overview({ txCount }: { txCount: number }) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return (
    <View style={styles.overview}>
      <View style={styles.infoCard}>
        <Ionicons name="gift-outline" size={22} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>Welcome bonus received</Text>
          <Text style={styles.infoText}>
            You started with 1,000 free E-Tokens. Use them to build rosters and
            predict BGMI match outcomes.
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="receipt-outline" size={22} color={colors.accent} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>{txCount} transaction{txCount === 1 ? '' : 's'}</Text>
          <Text style={styles.infoText}>
            Tap the "History" tab above to see every credit and debit on your
            account.
          </Text>
        </View>
      </View>

      <Text style={styles.disclaimer}>
        E-Tokens are virtual, free-to-play tokens for entertainment only. They
        hold no real-world monetary value.
      </Text>
    </View>
  );
}

function SegmentButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return (
    <Pressable onPress={onPress} style={[styles.segBtn, active && styles.segBtnActive]}>
      <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  heading: {
    color: colors.text,
    fontSize: font.xxl,
    fontWeight: '900',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },

  balanceCard: {
    ...shadow,
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  balanceLabel: { color: colors.onPrimaryMuted, fontSize: font.md, fontWeight: '700' },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  balanceValue: { color: colors.onPrimary, fontSize: 40, fontWeight: '900', lineHeight: 44 },
  balanceUnit: { color: colors.onPrimaryMuted, fontSize: font.md, fontWeight: '700', marginBottom: 6 },

  segment: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radius.pill,
    padding: spacing.xs,
  },
  segBtn: { flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radius.pill, alignItems: 'center' },
  segBtnActive: { backgroundColor: colors.cardAlt },
  segText: { color: colors.textMuted, fontWeight: '700', fontSize: font.md },
  segTextActive: { color: colors.text },

  overview: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingTop: spacing.sm },
  infoCard: {
    ...shadow,
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: { color: colors.text, fontSize: font.md, fontWeight: '700' },
  infoText: { color: colors.textMuted, fontSize: font.sm, marginTop: 2, lineHeight: 20 },
  disclaimer: {
    color: colors.textFaint,
    fontSize: font.sm - 1,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing.sm,
  },

  divider: { height: 1, backgroundColor: colors.border },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
