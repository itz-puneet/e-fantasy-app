// ============================================================================
//  app/(tabs)/index.tsx  ->  HOME SCREEN
//  Shows BGMI matches (newest first). A toggle switches to Valorant, which
//  currently shows a "coming soon" placeholder.
// ============================================================================
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FadeInItem from '../../components/FadeInItem';
import GameToggle, { type Game } from '../../components/GameToggle';
import MatchCard, { type Match } from '../../components/MatchCard';
import { font, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function Home() {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [game, setGame] = useState<Game>('BGMI');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMatches = useCallback(async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('id, game, title, map_name, start_time, status')
      .eq('game', 'BGMI')
      .order('start_time', { ascending: false }); // newest / most recent first

    if (!error && data) setMatches(data as Match[]);
    setLoading(false);
    setRefreshing(false);
  }, []);

  // Refresh on focus so match statuses (upcoming -> live/completed) stay current.
  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [loadMatches])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadMatches();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      {/* Header */}
      <Text style={styles.heading}>Matches</Text>
      <View style={styles.toggle}>
        <GameToggle value={game} onChange={setGame} />
      </View>

      {game === 'Valorant' ? (
        <ComingSoon />
      ) : loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(m) => m.id}
          renderItem={({ item, index }) => (
            <FadeInItem index={index} animKey={item.id}>
              <MatchCard match={item} onPress={() => router.push(`/match/${item.id}`)} />
            </FadeInItem>
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              No BGMI matches yet. Add some in Supabase (see seed.sql) or pull
              down to refresh.
            </Text>
          }
        />
      )}
    </View>
  );
}

function ComingSoon() {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return (
    <View style={styles.comingSoon}>
      <Ionicons name="rocket-outline" size={56} color={colors.accent} />
      <Text style={styles.comingTitle}>Valorant is coming soon!</Text>
      <Text style={styles.comingText}>
        We're working hard to bring Valorant fantasy matches to E-Fantasy. Stay
        tuned. For now, jump into BGMI!
      </Text>
    </View>
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
  toggle: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  comingSoon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  comingTitle: {
    color: colors.text,
    fontSize: font.xl,
    fontWeight: '800',
    marginTop: spacing.md,
  },
  comingText: {
    color: colors.textMuted,
    fontSize: font.md,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});
