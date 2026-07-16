// ============================================================================
//  app/(auth)/_layout.tsx
//  Groups the login screens (login + register) together. The parentheses in
//  "(auth)" mean it's just a group -- it does NOT show up in the web address.
// ============================================================================
import { Stack } from 'expo-router';
import { useTheme } from '../../constants/theme';

export default function AuthLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}
