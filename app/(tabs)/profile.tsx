// ============================================================================
//  app/(tabs)/profile.tsx  ->  PROFILE
//  Account details (email), appearance (light/dark), quick links, admin entry
//  (admins only), and Sign Out.
// ============================================================================
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const { session, isAdmin, signOut } = useAuth();

  const email = session?.user.email ?? '';
  const [username, setUsername] = useState('');

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) return;
    supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single()
      .then(({ data }) => setUsername(data?.username ?? ''));
  }, [session]);

  const initial = (username || email || '?').charAt(0).toUpperCase();

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + spacing.xl,
        }}
      >
        <Text style={styles.heading}>Profile</Text>

        {/* Account card */}
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.username} numberOfLines={1}>
              {username || 'Player'}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {email}
            </Text>
          </View>
        </View>

        {/* Appearance (light / dark) */}
        <Text style={styles.groupLabel}>Appearance</Text>
        <ThemeToggle />

        {/* Admin entry (admins only) */}
        {isAdmin ? (
          <View style={styles.group}>
            <MenuRow
              icon="shield-checkmark"
              iconColor={colors.accent}
              label="Admin Scoring Dashboard"
              onPress={() => router.push('/admin')}
            />
          </View>
        ) : null}

        {/* Legal / help links */}
        <Text style={styles.groupLabel}>About</Text>
        <View style={styles.group}>
          <MenuRow icon="document-text-outline" label="Terms & Conditions" onPress={() => router.push('/legal/terms')} />
          <Divider />
          <MenuRow icon="lock-closed-outline" label="Privacy Policy" onPress={() => router.push('/legal/privacy')} />
          <Divider />
          <MenuRow icon="help-circle-outline" label="Help & FAQ" onPress={() => router.push('/legal/help')} />
        </View>

        {/* Sign out */}
        <View style={styles.group}>
          <MenuRow icon="log-out-outline" iconColor={colors.danger} label="Sign Out" labelColor={colors.danger} hideChevron onPress={confirmSignOut} />
        </View>

        <Text style={styles.footer}>
          E-Fantasy • Free-to-play{'\n'}E-Tokens are virtual and hold no real-world value.
        </Text>
      </ScrollView>
    </View>
  );
}

function ThemeToggle() {
  const { colors, shadow, mode, setMode } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const options: { key: 'system' | 'light' | 'dark'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
    { key: 'light', label: 'Light', icon: 'sunny-outline' },
    { key: 'dark', label: 'Dark', icon: 'moon-outline' },
  ];
  return (
    <View style={styles.segment}>
      {options.map((o) => {
        const active = mode === o.key;
        return (
          <Pressable
            key={o.key}
            onPress={() => setMode(o.key)}
            style={[styles.segBtn, active && styles.segBtnActive]}
          >
            <Ionicons name={o.icon} size={16} color={active ? colors.onPrimary : colors.textMuted} />
            <Text style={[styles.segText, active && styles.segTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  iconColor,
  labelColor,
  hideChevron = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  iconColor?: string;
  labelColor?: string;
  hideChevron?: boolean;
}) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
      <Ionicons name={icon} size={20} color={iconColor ?? colors.textMuted} />
      <Text style={[styles.rowLabel, { color: labelColor ?? colors.text }]}>{label}</Text>
      {hideChevron ? null : <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />}
    </Pressable>
  );
}

function Divider() {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return <View style={styles.divider} />;
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    heading: {
      color: colors.text,
      fontSize: font.xxl,
      fontWeight: '900',
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.lg,
    },
    card: {
      ...shadow,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginHorizontal: spacing.lg,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { color: colors.onPrimary, fontSize: font.xl, fontWeight: '900' },
    username: { color: colors.text, fontSize: font.lg, fontWeight: '800' },
    email: { color: colors.textMuted, fontSize: font.sm, marginTop: 2 },

    segment: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.pill,
      padding: spacing.xs,
    },
    segBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: spacing.sm + 2,
      borderRadius: radius.pill,
    },
    segBtnActive: { backgroundColor: colors.primary },
    segText: { color: colors.textMuted, fontWeight: '700', fontSize: font.sm },
    segTextActive: { color: colors.onPrimary },

    groupLabel: {
      color: colors.textFaint,
      fontSize: font.sm,
      fontWeight: '700',
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      marginHorizontal: spacing.lg,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    group: {
      ...shadow,
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
    },
    rowLabel: { flex: 1, fontSize: font.md, fontWeight: '600' },
    divider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.md + 20 + spacing.md },
    footer: {
      color: colors.textFaint,
      fontSize: font.sm - 1,
      textAlign: 'center',
      lineHeight: 18,
      marginTop: spacing.xl,
    },
  });
