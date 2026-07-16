// ============================================================================
//  app/admin/create-player.tsx  ->  ADMIN: create a player (optionally on a team)
// ============================================================================
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import ChipSelect, { type ChipOption } from '../../components/ChipSelect';
import Field from '../../components/Field';
import ScreenHeader from '../../components/ScreenHeader';
import { spacing, useTheme, type ThemeColors, type ThemeShadow } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

const GAMES: ChipOption[] = [
  { label: 'BGMI', value: 'BGMI' },
  { label: 'Valorant', value: 'Valorant' },
];

export default function CreatePlayer() {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const router = useRouter();
  const { isAdmin } = useAuth();

  const [name, setName] = useState('');
  const [game, setGame] = useState<string | null>('BGMI');
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamOptions, setTeamOptions] = useState<ChipOption[]>([{ label: 'No team', value: null }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('esports_teams')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        const teams = (data ?? []).map((t: any) => ({ label: t.name, value: t.id as string }));
        setTeamOptions([{ label: 'No team', value: null }, ...teams]);
      });
  }, []);

  const submit = async () => {
    if (!name.trim()) return Alert.alert('Please enter a player name');
    setSaving(true);
    const { error } = await supabase.rpc('admin_create_player', {
      p_name: name.trim(),
      p_team_id: teamId,
      p_game: game,
    });
    setSaving(false);
    if (error) return Alert.alert('Could not create player', error.message);
    Alert.alert('Player created ✅', `"${name.trim()}" was added.`);
    router.back();
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="New Player" />
        <Text style={styles.denied}>You don't have admin access.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="New Player" subtitle="Add a pro player" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Field label="Player name" value={name} onChangeText={setName} placeholder="e.g. Jonathan" />
          <ChipSelect label="Game" options={GAMES} value={game} onChange={setGame} />
          <ChipSelect label="Team (optional)" options={teamOptions} value={teamId} onChange={setTeamId} />
          <Button label="Create Player" onPress={submit} loading={saving} style={{ marginTop: spacing.sm }} />
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
