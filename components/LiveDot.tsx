// ============================================================================
//  components/LiveDot.tsx
//  A small dot that gently pulses (scale + fade) to signal a LIVE match.
//  Used inside the LIVE status pills.
// ============================================================================
import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export default function LiveDot({ color, size = 6 }: { color: string; size?: number }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    // 0 -> 1 -> 0 forever (the `true` makes it reverse instead of jumping back).
    pulse.value = withRepeat(
      withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.5 + pulse.value * 0.5,
    transform: [{ scale: 0.85 + pulse.value * 0.4 }],
  }));

  return (
    <Animated.View
      style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}
    />
  );
}
