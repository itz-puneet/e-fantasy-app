// ============================================================================
//  app/_layout.tsx  (the ROOT of the whole app)
//  - Wraps everything in the ThemeProvider (light/dark) + AuthProvider.
//  - Acts as a "security guard": if you're logged out it sends you to the
//    Login screen; if you're logged in it sends you into the main app.
// ============================================================================
import { useFonts } from '@expo-google-fonts/manrope';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../constants/theme';
import { AuthProvider, useAuth } from '../lib/AuthContext';
import { applyManropeDefault, MANROPE_FONTS } from '../lib/fonts';

function RootNavigator() {
  const { session, loading } = useAuth();
  const { colors, scheme } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // wait until we know if a session exists

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Logged out but trying to see the app -> go log in.
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Logged in but still on a login screen -> go to the app.
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  // Status bar icons flip with the active theme.
  const statusBar = <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />;

  // Simple loading screen while we check the session at startup.
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        {statusBar}
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <>
      {statusBar}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  // Load the Manrope font family before showing anything. Gating the whole app
  // on this means text never flashes in the system font first.
  const [fontsLoaded, fontError] = useFonts(MANROPE_FONTS);

  if (!fontsLoaded && !fontError) {
    // Fonts still loading: a plain background (no text yet, so no wrong font).
    return <View style={{ flex: 1, backgroundColor: '#0F1115' }} />;
  }

  // Fonts are ready -> make Manrope the app-wide default for every <Text>.
  // (If loading errored we skip this so text safely falls back to the system
  // font instead of an unavailable one.)
  if (fontsLoaded) applyManropeDefault();

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
