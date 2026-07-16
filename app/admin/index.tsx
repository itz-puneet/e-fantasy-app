// ============================================================================
//  app/admin/index.tsx  ->  ADMIN DASHBOARD (match list)
//  Hidden screen: only reachable from the admin button on the Wallet screen,
//  and this screen refuses to render for non-admins. (The database also blocks
//  non-admins server-side, so this is just a friendly gate.)
// ============================================================================
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import StatusPill from '../../components/StatusPill';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';
import { formatMatchTime } from '../../lib/format';
import { supabase } from '../../lib/supabase';

type AdminMatch = {
  id: string;
  title: string;
  status: string;
  start_time: string;
  map_name: string | null;
};

export default function AdminHome() {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('matches')
      .select('id, title, status, start_time, map_name')
      .order('start_time', { ascending: false });
    if (data) setMatches(data as AdminMatch[]);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isAdmin) load();
    }, [isAdmin, load])
  );

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Admin" />
        <View style={styles.denied}>
          <Ionicons name="lock-closed" size={48} color={colors.textFaint} />
          <Text style={styles.deniedText}>You don't have admin access.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Admin Dashboard" subtitle="Pick a match to score" />
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/admin/${item.id}`)}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.rowTop}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <StatusPill status={item.status} />
                </View>
                <Text style={styles.meta}>{formatMatchTime(item.start_time)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListHeaderComponent={
            <View>
              <Text style={styles.sectionTitle}>Create new</Text>
              <View style={styles.createGrid}>
                <CreateButton icon="calendar" label="Match" onPress={() => router.push('/admin/create-match')} />
                <CreateButton icon="person-add" label="Player" onPress={() => router.push('/admin/create-player')} />
                <CreateButton icon="people" label="Team" onPress={() => router.push('/admin/create-team')} />
                <CreateButton icon="trophy" label="Contest" onPress={() => router.push('/admin/create-contest')} />
              </View>
              <Text style={styles.sectionTitle}>Score a match</Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No matches yet. Tap "Match" above to create one.</Text>
          }
          contentContainerStyle={{ padding: spacing.lg }}
        />
      )}
    </View>
  );
}

function CreateButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.7 }]}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.createBtnText}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  denied: { alignItems: 'center', marginTop: spacing.xl * 2, gap: spacing.md },
  deniedText: { color: colors.textMuted, fontSize: font.md },
  sectionTitle: {
    color: colors.text,
    fontSize: font.lg,
    fontWeight: '800',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  createGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  createBtn: {
    flexGrow: 1,
    flexBasis: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  createBtnText: { color: colors.text, fontSize: font.md, fontWeight: '700' },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { color: colors.text, fontSize: font.md, fontWeight: '700', flex: 1 },
  meta: { color: colors.textMuted, fontSize: font.sm, marginTop: 4 },
});
