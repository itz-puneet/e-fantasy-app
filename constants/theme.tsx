// ============================================================================
//  constants/theme.tsx  —  E-Fantasy design system ("Turf v1.0")
//  Dual light/dark theming. Components read the ACTIVE palette via useTheme():
//
//     const { colors, shadow } = useTheme();
//     const styles = useMemo(() => makeStyles(colors, shadow), [colors, shadow]);
//     const makeStyles = (colors: ThemeColors, shadow: ThemeShadow) =>
//       StyleSheet.create({ card: { ...shadow, backgroundColor: colors.card } });
//
//  spacing / radius / font / motion are theme-independent → imported directly.
//  Wrap the app in <ThemeProvider> (see app/_layout.tsx). Mode = system|light|dark,
//  persisted to AsyncStorage; "system" follows the OS (dark-first fallback).
// ============================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

// ---------------------------------------------------------------------------
//  Color palettes (spec §3) — mapped onto the app's existing token names.
// ---------------------------------------------------------------------------
export const darkColors = {
  bg: '#0F1115', // surface.base
  card: '#1C2029', // surface.card
  cardAlt: '#242A35', // surface.input (inactive toggles, elevated tiles)
  border: '#2C3340',

  primary: '#1FCB6B', // turf green
  primaryDark: '#17A657', // pressed
  accent: '#8B5CF6', // secondary (XP / premium / C-VC glow)

  onPrimary: '#04160B', // text/icons ON the green accent (dark text on bright green)
  onPrimaryMuted: 'rgba(4,22,11,0.72)',

  text: '#E6EAF0',
  textMuted: '#A3ACBD',
  textFaint: '#7E8899',

  success: '#1FCB6B',
  danger: '#FF5C5C',
  live: '#FF4D4D',
};

export const lightColors: ThemeColors = {
  bg: '#F1F3F7', // surface.base
  card: '#FFFFFF', // surface.card
  cardAlt: '#E7EBF1', // surface.sunken
  border: '#DCE1E9',

  primary: '#0B7D42', // turf green, darkened for AA on white
  primaryDark: '#095F33',
  accent: '#7C3AED',

  onPrimary: '#FFFFFF', // white text on the dark-green accent
  onPrimaryMuted: 'rgba(255,255,255,0.82)',

  text: '#14171C',
  textMuted: '#55606F',
  textFaint: '#6C7684',

  success: '#0B7D42',
  danger: '#D92D20',
  live: '#D42A24',
};

export type ThemeColors = typeof darkColors;

// ---------------------------------------------------------------------------
//  Elevation / shadow (spec §7) — dark leans on borders + a soft depth;
//  light uses soft drop shadows.
// ---------------------------------------------------------------------------
export const darkShadow = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.32,
  shadowRadius: 10,
  elevation: 4,
};
export const lightShadow: ThemeShadow = {
  shadowColor: '#1B2536',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
};
export type ThemeShadow = typeof darkShadow;

// ---------------------------------------------------------------------------
//  Theme-independent tokens
// ---------------------------------------------------------------------------
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const radius = { xs: 6, sm: 8, md: 12, lg: 16, xl: 20, pill: 999, circle: 9999 };

export const font = { sm: 13, md: 15, lg: 18, xl: 24, xxl: 34 };

// Motion tokens (spec §9) — used by the Stage-2 Reanimated micro-animations.
export const motion = {
  duration: { instant: 100, fast: 160, base: 220, slow: 320, celebrate: 500 },
  spring: {
    snappy: { damping: 18, stiffness: 220, mass: 0.9 },
    celebrate: { damping: 14, stiffness: 180, mass: 1 },
  },
};

// Gradients (spec §8) — pairs for expo-linear-gradient (Stage 2).
export const gradients = {
  cta: { dark: ['#1FCB6B', '#16B85F'], light: ['#0E8F4C', '#0B7D42'] },
  live: ['#FF4D4D', '#E5352E'],
  premium: ['#8B5CF6', '#6D28D9'],
};

// ---------------------------------------------------------------------------
//  Theme context / provider / hook
// ---------------------------------------------------------------------------
type ThemeMode = 'system' | 'light' | 'dark';
type ThemeValue = {
  colors: ThemeColors;
  shadow: ThemeShadow;
  scheme: 'light' | 'dark'; // the resolved scheme actually in use
  mode: ThemeMode; // the user's preference
  setMode: (m: ThemeMode) => void;
};

const STORAGE_KEY = 'efantasy-theme-mode';

const ThemeContext = createContext<ThemeValue>({
  colors: darkColors,
  shadow: darkShadow,
  scheme: 'dark',
  mode: 'system',
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Load the saved preference once.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') setModeState(saved);
    });
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m);
  };

  // "system" follows the OS; dark-first fallback when the OS reports nothing.
  const scheme: 'light' | 'dark' = mode === 'system' ? (system ?? 'dark') : mode;

  const value = useMemo<ThemeValue>(
    () => ({
      colors: scheme === 'dark' ? darkColors : lightColors,
      shadow: scheme === 'dark' ? darkShadow : lightShadow,
      scheme,
      mode,
      setMode,
    }),
    [scheme, mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
