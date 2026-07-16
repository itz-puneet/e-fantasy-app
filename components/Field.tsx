// ============================================================================
//  components/Field.tsx
//  A labelled text box used on the Login / Register screens. Pass
//  secureToggle to get a password field with a show/hide (eye) button.
// ============================================================================
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { font, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../constants/theme';

type Props = TextInputProps & { label: string; secureToggle?: boolean };

export default function Field({ label, secureToggle, ...props }: Props) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const [hidden, setHidden] = useState(true);
  const isSecure = secureToggle ? hidden : props.secureTextEntry;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          {...props}
          secureTextEntry={isSecure}
          placeholderTextColor={colors.textFaint}
          style={styles.input}
        />
        {secureToggle ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} style={styles.eye}>
            <Ionicons name={hidden ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) =>
  StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { color: colors.textMuted, fontSize: font.sm, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, height: 52, color: colors.text, fontSize: font.md },
  eye: { paddingLeft: spacing.sm },
});
