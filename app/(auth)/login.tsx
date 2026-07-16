// ============================================================================
//  app/(auth)/login.tsx
//  Returning users log in with email + password. On success the security guard
//  in _layout.tsx moves them into the app.
// ============================================================================
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Field from '../../components/Field';
import { font, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return Alert.alert('Enter your email and password');

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Login failed', error.message);
      return;
    }
    // Success! onAuthStateChange fires -> _layout.tsx redirects into the app.
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + spacing.xl * 2, paddingBottom: insets.bottom + spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>
          E-<Text style={{ color: colors.primary, fontWeight: '900' }}>Fantasy</Text>
        </Text>
        <Text style={styles.tagline}>Welcome back. Log in to build your rosters.</Text>

        <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Password" value={password} onChangeText={setPassword} placeholder="Your password" autoCapitalize="none" secureToggle />

        <Button label="Log In" onPress={handleLogin} loading={loading} style={{ marginTop: spacing.md }} />

        <Pressable onPress={() => router.replace('/(auth)/register')} style={styles.linkRow}>
          <Text style={styles.linkText}>
            New player? <Text style={styles.linkStrong}>Create an account</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { paddingHorizontal: spacing.lg, gap: spacing.md },
    logo: { color: colors.text, fontSize: font.xxl, fontWeight: '900' },
    tagline: { color: colors.textMuted, fontSize: font.md, marginTop: spacing.xs, marginBottom: spacing.lg },
    linkRow: { alignItems: 'center', marginTop: spacing.lg },
    linkText: { color: colors.textMuted, fontSize: font.md },
    linkStrong: { color: colors.primary, fontWeight: '700' },
  });
