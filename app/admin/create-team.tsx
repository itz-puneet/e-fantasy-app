// ============================================================================
//  app/admin/create-team.tsx  ->  ADMIN: create an esports team
// ============================================================================
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import ChipSelect from '../../components/ChipSelect';
import Field from '../../components/Field';
import ScreenHeader from '../../components/ScreenHeader';
import { spacing, useTheme, type ThemeColors, type ThemeShadow } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

const GAMES = [
  { label: 'BGMI', value: 'BGMI' },
  { label: 'Valorant', value: 'Valorant' },
];

export default function CreateTeam() {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [name, setName] = useState('');
  const [game, setGame] = useState<string | null>('BGMI');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) return Alert.alert('Please enter a team name');
    setSaving(true);
    const { error } = await supabase.rpc('admin_create_team', { p_name: name.trim(), p_game: game });
    setSaving(false);
    if (error) return Alert.alert('Could not create team', error.message);
    Alert.alert('Team created ✅', `"${name.trim()}" was added.`);
    router.back();
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="New Team" />
        <Text style={styles.denied}>You don't have admin access.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="New Team" subtitle="Add an esports team" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Field label="Team name" value={name} onChangeText={setName} placeholder="e.g. Godlike Esports" />
          <ChipSelect label="Game" options={GAMES} value={game} onChange={setGame} />
          <Button label="Create Team" onPress={submit} loading={saving} style={{ marginTop: spacing.sm }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  form: { padding: spacing.lg, gap: spacing.md },
  denied: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
