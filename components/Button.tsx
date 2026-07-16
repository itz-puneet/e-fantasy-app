// ============================================================================
//  components/Button.tsx
//  One reusable button used across the app. Shows a spinner while "loading".
// ============================================================================
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { font, motion, radius, spacing, useTheme, type ThemeColors, type ThemeShadow } from '../constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
  style?: ViewStyle;
};

export default function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}: Props) {
  const { colors, shadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
  const isDisabled = disabled || loading;
  const isGhost = variant === 'ghost';

  // Press feedback: a quick scale-down on touch, spring back on release.
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          if (!isDisabled) scale.value = withTiming(0.96, { duration: motion.duration.instant });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, motion.spring.snappy);
        }}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          isGhost ? styles.ghost : styles.primary,
          isDisabled && styles.disabled,
          pressed && !isDisabled && styles.pressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={isGhost ? colors.text : colors.onPrimary} />
        ) : (
          <Text style={[styles.label, isGhost && styles.ghostLabel]}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) =>
  StyleSheet.create({
    base: {
      height: 52,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
    },
    primary: { backgroundColor: colors.primary },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.85 },
    label: { color: colors.onPrimary, fontSize: font.md, fontWeight: '700' },
    ghostLabel: { color: colors.text },
  });
