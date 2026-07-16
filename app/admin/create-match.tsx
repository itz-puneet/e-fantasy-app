// ============================================================================
//  app/admin/create-match.tsx  ->  ADMIN: create a match
//  Date/time are entered as plain text (YYYY-MM-DD and HH:MM) so this works on
//  phone AND web with no extra date-picker dependency. Quick presets fill them.
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
import Button from '../../components/Button';
import ChipSelect, { type ChipOption } from '../../components/ChipSelect';
import Field from '../../components/Field';
import ScreenHeader from '../../components/ScreenHeader';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

const GAMES: ChipOption[] = [
  { label: 'BGMI', value: 'BGMI' },
  { label: 'Valorant', value: 'Valorant' },
];
const STATUSES: ChipOption[] = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Live', value: 'live' },
  { label: 'Completed', value: 'completed' },
];

const pad = (n: number) => n.toString().padStart(2, '0');
const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeStr = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export default function CreateMatch() {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const router = useRouter();
  const { isAdmin } = useAuth();

  const now = new Date();
  const [title, setTitle] = useState('');
  const [mapName, setMapName] = useState('');
  const [game, setGame] = useState<string | null>('BGMI');
  const [status, setStatus] = useState<string | null>('upcoming');
  const [date, setDate] = useState(toDateStr(now));
  const [time, setTime] = useState(toTimeStr(now));
  const [saving, setSaving] = useState(false);

  const applyPreset = (msFromNow: number) => {
    const d = new Date(Date.now() + msFromNow);
    setDate(toDateStr(d));
    setTime(toTimeStr(d));
  };

  const submit = async () => {
    if (!title.trim()) return Alert.alert('Please enter a match title');

    const dm = date.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    const tm = time.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!dm) return Alert.alert('Date must look like YYYY-MM-DD', 'e.g. 2026-07-15');
    if (!tm) return Alert.alert('Time must look like HH:MM (24-hour)', 'e.g. 20:30');

    const dt = new Date(+dm[1], +dm[2] - 1, +dm[3], +tm[1], +tm[2]);
    if (isNaN(dt.getTime()) || dt.getMonth() !== +dm[2] - 1 || dt.getDate() !== +dm[3]) {
      return Alert.alert('That date/time is not valid', 'Please check the numbers.');
    }
    if (+tm[1] > 23 || +tm[2] > 59) return Alert.alert('Time is out of range', 'Use 00:00 to 23:59.');

    setSaving(true);
    const { error } = await supabase.rpc('admin_create_match', {
      p_title: title.trim(),
      p_game: game,
      p_map_name: mapName.trim() || null,
      p_start_time: dt.toISOString(),
      p_status: status,
    });
    setSaving(false);
    if (error) return Alert.alert('Could not create match', error.message);
    Alert.alert('Match created ✅', `"${title.trim()}" was added.`);
    router.back();
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="New Match" />
        <Text style={styles.denied}>You don't have admin access.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="New Match" subtitle="Schedule a match" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Field label="Match title" value={title} onChangeText={setTitle} placeholder="e.g. BGMI Pro League - Match 5" />
          <Field label="Map (optional)" value={mapName} onChangeText={setMapName} placeholder="e.g. Erangel" />
          <ChipSelect label="Game" options={GAMES} value={game} onChange={setGame} />

          <View style={styles.dateRow}>
            <View style={{ flex: 1 }}>
              <Field label="Start date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" autoCapitalize="none" />
            </View>
            <View style={{ width: 110 }}>
              <Field label="Time (24h)" value={time} onChangeText={setTime} placeholder="HH:MM" autoCapitalize="none" />
            </View>
          </View>

          {/* Quick presets */}
          <View style={styles.presets}>
            <Preset label="+1 hour" onPress={() => applyPreset(60 * 60 * 1000)} />
            <Preset label="+3 hours" onPress={() => applyPreset(3 * 60 * 60 * 1000)} />
            <Preset label="Tomorrow" onPress={() => applyPreset(24 * 60 * 60 * 1000)} />
            <Preset label="+2 days" onPress={() => applyPreset(2 * 24 * 60 * 60 * 1000)} />
          </View>

          <ChipSelect label="Status" options={STATUSES} value={status} onChange={setStatus} />

          <Button label="Create Match" onPress={submit} loading={saving} style={{ marginTop: spacing.sm }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Preset({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.preset, pressed && { opacity: 0.7 }]}>
      <Text style={styles.presetText}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  form: { padding: spacing.lg, gap: spacing.md },
  denied: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
  dateRow: { flexDirection: 'row', gap: spacing.md },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  preset: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  presetText: { color: colors.textMuted, fontWeight: '600', fontSize: font.sm },
});
