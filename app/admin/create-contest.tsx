// ============================================================================
//  app/admin/create-contest.tsx  ->  ADMIN: create a tournament (contest)
//  A contest belongs to a match, so you pick the match first.
// ============================================================================
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '../../components/Button';
import ChipSelect, { type ChipOption } from '../../components/ChipSelect';
import Field from '../../components/Field';
import ScreenHeader from '../../components/ScreenHeader';
import { font, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

// Postgres `integer` ceiling — entry_fee / prize_pool / max_entries are stored
// as int, so keep the app's numbers within range (friendly message vs raw DB error).
const INT_MAX = 2147483647;

export default function CreateContest() {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const router = useRouter();
  const { isAdmin } = useAuth();

  const [matchOptions, setMatchOptions] = useState<ChipOption[]>([]);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [entryFee, setEntryFee] = useState('0');
  const [maxEntries, setMaxEntries] = useState('');
  const [maxPerUser, setMaxPerUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Contests can only be attached to UPCOMING matches (a contest on a
    // started/finished match makes no sense), so only offer those.
    supabase
      .from('matches')
      .select('id, title')
      .eq('status', 'upcoming')
      .order('start_time', { ascending: false })
      .then(({ data }) => {
        setMatchOptions((data ?? []).map((m: any) => ({ label: m.title, value: m.id as string })));
        setLoading(false);
      });
  }, []);

  const parseNonNegInt = (s: string): number | null => {
    if (s.trim() === '') return 0;
    const n = Number(s);
    if (!Number.isInteger(n) || n < 0 || n > INT_MAX) return null;
    return n;
  };

  const submit = async () => {
    if (!matchId) return Alert.alert('Please pick a match for this contest');
    if (!name.trim()) return Alert.alert('Please enter a contest name');

    const fee = parseNonNegInt(entryFee);
    if (fee === null) return Alert.alert('Entry fee must be a whole number from 0 to 2,147,483,647');

    let max: number | null = null;
    if (maxEntries.trim() !== '') {
      const m = Number(maxEntries);
      if (!Number.isInteger(m) || m <= 0 || m > INT_MAX)
        return Alert.alert('Max entries must be a positive whole number (or leave it blank)');
      max = m;
    }

    let maxUser: number | null = null;
    if (maxPerUser.trim() !== '') {
      const mu = Number(maxPerUser);
      if (!Number.isInteger(mu) || mu <= 0 || mu > INT_MAX)
        return Alert.alert('Max teams per user must be a positive whole number (or leave it blank)');
      maxUser = mu;
    }

    setSaving(true);
    const { error } = await supabase.rpc('admin_create_tournament', {
      p_match_id: matchId,
      p_name: name.trim(),
      p_entry_fee: fee,
      p_max_entries: max,
      p_max_entries_per_user: maxUser,
    });
    setSaving(false);
    if (error) return Alert.alert('Could not create contest', error.message);
    Alert.alert('Contest created ✅', `"${name.trim()}" was added.`);
    router.back();
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="New Contest" />
        <Text style={styles.denied}>You don't have admin access.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="New Contest" subtitle="Add a contest to a match" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
          ) : matchOptions.length === 0 ? (
            <Text style={styles.hint}>
              No upcoming matches. Create an upcoming match first, then add contests to it.
              (Contests can't be added to matches that are live or completed.)
            </Text>
          ) : (
            <ChipSelect label="Match" options={matchOptions} value={matchId} onChange={setMatchId} />
          )}

          <Field label="Contest name" value={name} onChangeText={setName} placeholder="e.g. Mega Contest" />
          <Field label="Entry fee (E-Tokens)" value={entryFee} onChangeText={setEntryFee} placeholder="0" keyboardType="number-pad" />
          <Text style={styles.hint}>
            💰 The prize pool is automatic — it's the total of all entry fees and grows as players join.
          </Text>
          <Field label="Max entries (blank = unlimited)" value={maxEntries} onChangeText={setMaxEntries} placeholder="Unlimited" keyboardType="number-pad" />
          <Field label="Max teams per user (blank = unlimited)" value={maxPerUser} onChangeText={setMaxPerUser} placeholder="Unlimited" keyboardType="number-pad" />

          <Button label="Create Contest" onPress={submit} loading={saving} disabled={loading} style={{ marginTop: spacing.sm }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  form: { padding: spacing.lg, gap: spacing.md },
  denied: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
  hint: { color: colors.textMuted, fontSize: font.md, lineHeight: 20 },
});
