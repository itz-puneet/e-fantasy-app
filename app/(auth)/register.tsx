// ============================================================================
//  app/(auth)/register.tsx
//  Create an account with username + email + mobile + password.
//  No OTP / email verification: as long as "Confirm email" is turned OFF in
//  Supabase (Authentication -> Providers -> Email), the user is logged in
//  instantly and the security guard in _layout.tsx moves them into the app.
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
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Field from '../../components/Field';
import { font, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

const MIN_PASSWORD = 6; // Supabase's default minimum

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanName = username.trim();

    // --- Validation ---
    if (!cleanName) return Alert.alert('Please enter a username');
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail))
      return Alert.alert('Please enter a valid email address');
    if (cleanPhone.replace(/\D/g, '').length < 10)
      return Alert.alert('Please enter a valid 10-digit mobile number');
    if (password.length < MIN_PASSWORD)
      return Alert.alert(`Password must be at least ${MIN_PASSWORD} characters`);
    if (password !== confirm) return Alert.alert('Passwords do not match');

    setLoading(true);
    // Creates the account. phone + username are saved to the account's metadata,
    // which the database trigger copies into the profiles table (and grants the
    // 1,000 welcome tokens).
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { phone: cleanPhone, username: cleanName } },
    });
    setLoading(false);

    if (error) {
      Alert.alert('Could not sign up', error.message);
      return;
    }

    // If "Confirm email" is still ON in Supabase, no session is returned and
    // (with no SMTP) the user would be stuck. Tell them exactly how to fix it.
    if (!data.session) {
      Alert.alert(
        'One setting to change',
        'Your account was created but not activated because "Confirm email" is ON in Supabase.\n\nTurn it OFF: Authentication → Providers → Email → disable "Confirm email". Then log in.'
      );
      router.replace('/(auth)/login');
      return;
    }
    // Success! onAuthStateChange fires -> _layout.tsx redirects into the app.
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>
          E-<Text style={{ color: colors.primary, fontWeight: '900' }}>Fantasy</Text>
        </Text>
        <Text style={styles.tagline}>Create your account and grab 1,000 free tokens.</Text>

        <View style={styles.form}>
          <Field label="Username" value={username} onChangeText={setUsername} placeholder="e.g. ProGamer99" autoCapitalize="none" />
          <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Field label="Mobile number" value={phone} onChangeText={setPhone} placeholder="10-digit number" keyboardType="phone-pad" />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder={`At least ${MIN_PASSWORD} characters`} autoCapitalize="none" secureToggle />
          <Field label="Confirm password" value={confirm} onChangeText={setConfirm} placeholder="Re-enter password" autoCapitalize="none" secureToggle />

          <Button label="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: spacing.sm }} />

          <Pressable onPress={() => router.replace('/(auth)/login')} style={styles.linkRow}>
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkStrong}>Log in</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { paddingHorizontal: spacing.lg },
    logo: { color: colors.text, fontSize: font.xxl, fontWeight: '900' },
    tagline: { color: colors.textMuted, fontSize: font.md, marginTop: spacing.xs, marginBottom: spacing.xl },
    form: { gap: spacing.md },
    linkRow: { alignItems: 'center', marginTop: spacing.md },
    linkText: { color: colors.textMuted, fontSize: font.md },
    linkStrong: { color: colors.primary, fontWeight: '700' },
  });
