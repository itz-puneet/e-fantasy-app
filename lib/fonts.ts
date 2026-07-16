// ============================================================================
//  lib/fonts.ts
//  Loads the Manrope font family and makes it the app-wide default.
//
//  React Native has no built-in "use one font for the whole app", and on RN 0.81
//  <Text> is a plain function component (so the old "patch Text.render" trick
//  does nothing). Instead we wrap the JSX runtime: every <Text>/<TextInput> the
//  app renders goes through jsx()/jsxs() (release) or jsxDEV() (Expo Go dev),
//  so we intercept those and inject the Manrope weight that matches each
//  element's fontWeight. Every existing style keeps working untouched; a style
//  that sets its own fontFamily still wins.
//
//  Why map fontWeight -> a specific file: this package ships one file per weight
//  (there is no single "variable" Manrope), and named font files ignore
//  fontWeight — so the correct file must be chosen here.
// ============================================================================
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { StyleSheet, Text as RNText, TextInput as RNTextInput } from 'react-native';

// The weights we actually load. Keep this list and WEIGHT_TO_FAMILY in sync.
export const MANROPE_FONTS = {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
};

// Every CSS-style fontWeight the app uses -> the closest loaded Manrope file.
const WEIGHT_TO_FAMILY: Record<string, string> = {
  '100': 'Manrope_400Regular',
  '200': 'Manrope_400Regular',
  '300': 'Manrope_400Regular',
  '400': 'Manrope_400Regular',
  normal: 'Manrope_400Regular',
  '500': 'Manrope_500Medium',
  '600': 'Manrope_600SemiBold',
  '700': 'Manrope_700Bold',
  bold: 'Manrope_700Bold',
  '800': 'Manrope_800ExtraBold',
  '900': 'Manrope_800ExtraBold',
};

function familyFor(style: unknown): string {
  const flat = (StyleSheet.flatten(style as any) || {}) as { fontFamily?: string; fontWeight?: string | number };
  if (flat.fontFamily) return flat.fontFamily; // an explicitly-chosen font always wins
  const weight = flat.fontWeight != null ? String(flat.fontWeight) : '400';
  return WEIGHT_TO_FAMILY[weight] ?? 'Manrope_400Regular';
}

// Given the element type + its props, return props with a default Manrope
// fontFamily prepended (only for Text / TextInput; everything else untouched).
function withManrope(type: unknown, props: any): any {
  if (type !== RNText && type !== RNTextInput) return props;
  const family = familyFor(props?.style);
  // Prepend so the element's own style (incl. any explicit fontFamily) still wins.
  return { ...props, style: [{ fontFamily: family }, props?.style] };
}

// Wrap the given jsx runtime functions. Signature is jsx(type, props, key, ...):
// children live inside props and key/dev-info are the trailing args, so we only
// transform `props` and pass everything else straight through.
function patchRuntime(runtime: any, keys: string[]) {
  if (!runtime) return;
  for (const key of keys) {
    const original = runtime[key];
    if (typeof original !== 'function' || original.__manropeWrapped) continue;
    const wrapped = function (this: unknown, type: unknown, props: any, ...rest: unknown[]) {
      return original.call(this, type, withManrope(type, props), ...rest);
    };
    (wrapped as any).__manropeWrapped = true;
    try {
      runtime[key] = wrapped;
    } catch {
      // If the runtime export is read-only we simply skip it; text then falls
      // back to the system font (no crash).
    }
  }
}

let applied = false;
export function applyManropeDefault() {
  if (applied) return;
  applied = true;
  // Release builds compile JSX to jsx()/jsxs(); Expo Go (dev) uses jsxDEV().
  // Patch whichever exist so both paths pick up Manrope.
  try {
    patchRuntime(require('react/jsx-runtime'), ['jsx', 'jsxs']);
  } catch {}
  try {
    patchRuntime(require('react/jsx-dev-runtime'), ['jsxDEV']);
  } catch {}
}
