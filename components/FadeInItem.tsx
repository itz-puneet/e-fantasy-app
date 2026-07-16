// ============================================================================
//  components/FadeInItem.tsx
//  Wraps a list item so it fades + slides up as it appears. Pass the item's
//  `index` for a gentle staggered entrance. Set `withLayout` on lists whose
//  rows can re-order (e.g. the leaderboard) so position changes animate too.
//
//  FlatList unmounts rows that scroll far off-screen and remounts them on the
//  way back, which would otherwise replay the entrance every time. Passing a
//  stable `animKey` (the item's id) makes each row animate only once per
//  session — off-screen rows that return simply appear, no re-fade.
// ============================================================================
import { type ReactNode } from 'react';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { motion } from '../constants/theme';

// Remembers which items have already played their entrance this session.
const seen = new Set<string>();

export default function FadeInItem({
  index = 0,
  withLayout = false,
  animKey,
  children,
}: {
  index?: number;
  withLayout?: boolean;
  animKey?: string;
  children: ReactNode;
}) {
  const firstTime = animKey == null || !seen.has(animKey);
  if (animKey != null) seen.add(animKey);

  return (
    <Animated.View
      entering={
        firstTime ? FadeInDown.duration(motion.duration.base).delay(Math.min(index, 8) * 45) : undefined
      }
      layout={withLayout ? LinearTransition.duration(motion.duration.base) : undefined}
    >
      {children}
    </Animated.View>
  );
}
