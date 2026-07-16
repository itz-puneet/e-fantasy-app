# E‑Fantasy Design System — "Turf" v1.0

A complete, dual‑theme design system for E‑Fantasy (free‑to‑play fantasy BGMI). Built as Discord's layered‑surface, single‑accent card skeleton executed with Twitch's live‑event conviction — contrast‑earned depth that survives Indian daylight, a saturated turf‑green that owns "LIVE," a dedicated LIVE‑red, celebratory motion on glory and calm motion on money. Maps 1:1 to a React Native `theme.ts` + Reanimated. All contrast ratios below were computed against WCAG 2.1.

---

## 1. Design principles

1. **Trust where money lives, energy where glory happens** — calm surfaces and restrained motion around the wallet/tokens; celebratory motion reserved for rank surges and contest wins.
2. **One load‑bearing accent** — turf‑green means "brand + act now"; never decoration. Team identity is a color *dot*, never a full‑row tint.
3. **Depth is earned by contrast, not 6% grey deltas** — luminance steps + hairline borders that stay legible outdoors on mid‑range Android.
4. **Numbers are the hero** — tokens, ranks, multipliers, and live points are tabular, heavy, and near‑white for at‑a‑glance reading.
5. **Distinctive, consistent shapes** — 16:9 match heroes, 3:4 team box art, 1:1 avatars make the feed instantly scannable.
6. **Dual‑theme, AA‑minimum, always** — every text/surface and text/accent pair ships at ≥4.5:1 (large/UI ≥3:1); no glow that RN can't render cheaply on Android.
7. **Friendly, rounded, gaming‑native** — pill CTAs, soft radii, playful empty states; trustworthy without being corporate‑stiff.

## 2. Verdict

**Discord gives us the skeleton; Twitch gives us the pulse.** From Discord: the three‑to‑four stacked‑surface card model, single‑accent discipline, rounded/friendly shape language, dual theme, and calm money‑motion. From Twitch: dark‑first default, contrast‑driven hierarchy that survives daylight glare, the 16:9 / 3:4 / 1:1 ratio system, a dedicated LIVE‑red, and celebratory spring motion on the leaderboard overtake and contest win. **Accent decision:** ONE primary — turf‑green, `#1FCB6B` on dark / `#0B7D42` on light (the brand hue held constant conceptually, but darkened on light backgrounds so it passes AA on white — a neon green on white would read as a casino, which a virtual‑economy app must avoid). **Optional secondary:** an electric violet `#8B5CF6` (a nod to both Blurple and Ultraviolet), used *sparingly* for XP/streak/premium accents and the C/VC multiplier badge glow — never for primary CTAs. Per‑team accents are rejected as an AA catastrophe; team tribalism is carried by a single role‑color dot.

---

## 3. Color

### 3.1 Dark theme (default)

**Surfaces** — get lighter as they come forward; separation reinforced by hairline borders.

| Token | Hex | Use |
|---|---|---|
| `surface.base` | `#0F1115` | App background, root of every screen |
| `surface.raised` | `#171A21` | Sheets, nav bar, sticky headers |
| `surface.card` | `#1C2029` | Cards, list rows, panels |
| `surface.input` | `#242A35` | Inputs, chips, hover/pressed rows, elevated tiles |

**Text**

| Token | Hex | On surface | Ratio |
|---|---|---|---|
| `text.primary` | `#E6EAF0` | base / card | **15.65:1** / **13.50:1** |
| `text.secondary` | `#A3ACBD` | card | **7.14:1** |
| `text.faint` | `#7E8899` | card | ~4.4:1 (large/metadata only) |
| `text.onAccent` | `#04160B` | accent | **8.72:1** |

**Primary (turf‑green) & states**

| Token | Hex | Note |
|---|---|---|
| `accent` | `#1FCB6B` | Primary CTA fill, brand. As text on base: **8.83:1** |
| `accent.hover` | `#33D97C` | Pressed‑in / focus lift |
| `accent.pressed` | `#17A657` | Active press |
| `accent.disabled` | `#1F3A2B` | Fill; label `text.faint` |
| `accent.tint` | `rgba(31,203,107,0.14)` | Subtle backgrounds behind green elements |

**Secondary accent**

| Token | Hex | Use |
|---|---|---|
| `secondary` | `#8B5CF6` | XP/streak/premium, C/VC badge glow. On base: 4.46:1 (large/UI) |
| `secondary.hover` | `#A78BFA` | — |

**Borders / dividers**

| Token | Hex |
|---|---|
| `border.default` | `#2C3340` |
| `border.hairline` | `#232A34` |
| `border.focus` | `#1FCB6B` |

**Semantic**

| Token | Hex | On card |
|---|---|---|
| `success` | `#1FCB6B` | 8.02:1 |
| `warning` | `#FFC53D` | **10.33:1** |
| `danger` | `#FF5C5C` | 5.39:1 |
| `live` | `#FF4D4D` | 5.78:1 (dedicated LIVE red, distinct token from danger) |
| `info` | `#4EA8FF` | 6.50:1 |

### 3.2 Light theme

**Surfaces** — base is a soft off‑white; cards float on white with soft shadow.

| Token | Hex | Use |
|---|---|---|
| `surface.base` | `#F1F3F7` | App background |
| `surface.card` | `#FFFFFF` | Cards, rows, panels |
| `surface.raised` | `#FFFFFF` | Sheets/headers (+ shadow, not lightness) |
| `surface.sunken` | `#E7EBF1` | Segmented‑control track, progress track, wells |

**Text**

| Token | Hex | On surface | Ratio |
|---|---|---|---|
| `text.primary` | `#14171C` | card / base | **17.96:1** / **16.74:1** |
| `text.secondary` | `#55606F` | card | **6.39:1** |
| `text.faint` | `#6C7684` | card | **4.60:1** |
| `text.onAccent` | `#FFFFFF` | primary | **5.22:1** |

**Primary (turf‑green, darkened for AA on white) & states**

| Token | Hex | Note |
|---|---|---|
| `accent` | `#0B7D42` | CTA fill; white text **5.22:1** |
| `accent.hover` | `#0A6E3A` | — |
| `accent.pressed` | `#095F33` | — |
| `accent.disabled` | `#BFE6CE` | Fill; label `#5E8A70` |
| `accent.text` | `#0A6E3A` | Green text on light bg: **5.92:1** |
| `accent.tint` | `#E4F6EC` | Green‑tinted backgrounds |

**Secondary / borders / semantic**

| Token | Hex | Note |
|---|---|---|
| `secondary` | `#7C3AED` | On base **5.31:1** |
| `border.default` | `#DCE1E9` | — |
| `border.hairline` | `#EAEDF2` | — |
| `success` | `#0B7D42` | white text 5.22:1 |
| `warning` | `#B27600` text on `#FFF3D6` | text on card ~4.8:1 |
| `danger` | `#D92D20` | on card **4.83:1** |
| `live` | `#D42A24` | dedicated LIVE red |
| `info` | `#1D6FE0` | on card **4.77:1** |

> **Brand‑constancy note:** the turf‑green *hue* is the brand; only its lightness shifts between themes to satisfy AA (Discord keeps brand constant across themes — we honor the spirit while refusing an inaccessible neon on white). Semantic reds/greens/yellows follow the same rule.

---

## 4. Typography

**Family: Manrope** — Expo‑available via `@expo-google-fonts/manrope`. A geometric‑humanist sans that stands in for both Roobert and gg sans; excellent tabular figures for a numbers‑heavy app. (Roobert & gg sans are proprietary — excluded.)

Weights loaded: `Manrope_400Regular`, `_500Medium`, `_600SemiBold`, `_700Bold`, `_800ExtraBold`.

| Role | Size | Weight | Line‑height | Usage |
|---|---|---|---|---|
| `display` | 34 | 800 ExtraBold | 40 | Wallet balance, hero score, contest prize |
| `h1` | 28 | 700 Bold | 34 | Screen titles |
| `h2` | 22 | 700 Bold | 28 | Section headers |
| `title` | 18 | 600 SemiBold | 24 | Card titles, player names, contest names |
| `body` | 15 | 400 Regular | 22 | Body copy (500 Medium for emphasis) |
| `label` | 13 | 600 SemiBold | 16 | Buttons, tabs, chips, pills · letter‑spacing +0.2 |
| `caption` | 11 | 500 Medium | 14 | Timestamps, metadata, helper text |

**Numeric usage (critical):** all E‑Tokens, ranks, multipliers (C 2×, VC 1.5×), live points, and countdowns use **tabular figures** (`fontVariant: ['tabular-nums']`), **SemiBold/Bold**, and `text.primary`. Player names and point values are always **≥600 weight** so they read as the anchors of every row. Never render a live/token number below Medium weight or in `text.faint`.

---

## 5. Spacing, layout & touch targets

**4‑pt scale** (`theme.space`):

| Token | px |
|---|---|
| `0` | 0 |
| `1` | 4 |
| `2` | 8 |
| `3` | 12 |
| `4` | 16 |
| `5` | 20 |
| `6` | 24 |
| `8` | 32 |
| `10` | 40 |
| `12` | 48 |

**Layout / grid**
- Screen gutter: `space.4` (16) horizontal.
- Card inner padding: `space.4` (16); compact list rows `space.3` (12) vertical.
- Gap between stacked cards: `space.3` (12); between sections: `space.6` (24).
- Section header → content gap: `space.3` (12).
- Content max readable width: 640 (center on tablets).
- List rhythm: 12px vertical row padding, hairline divider or 8px gap between rows.

**Touch targets:** minimum **48×48 dp** for any tappable element (chips, tab items, icon buttons). Increase hit‑slop, not visual size, for small chips.

---

## 6. Radius

| Token | px | Use |
|---|---|---|
| `radius.xs` | 6 | Inline chips, badges |
| `radius.sm` | 8 | Inputs, small tiles |
| `radius.md` | 12 | Cards, sheets, list rows |
| `radius.lg` | 16 | Hero cards, modals, bottom sheets |
| `radius.xl` | 20 | Full‑bleed feature panels |
| `radius.pill` | 999 | Buttons, filter tags, status pills, segmented control |
| `radius.circle` | 9999 | Avatars, C/VC toggle dots |

---

## 7. Elevation & shadows

Defined **separately per theme**. Dark leans on surface‑lightness + hairline borders; light uses soft drop shadows. Glow is reserved and used sparingly (Android renders soft shadows/glow expensively).

### Dark

| Level | Technique |
|---|---|
| `e0` flat | `surface.card`, no shadow |
| `e1` card | `surface.card` + 1px `border.hairline` (#232A34) |
| `e2` raised/sheet | `surface.input` + 1px `border.default` + shadow `#000000` opacity **0.40**, radius **16**, offset `{0,8}`, Android `elevation: 8` |
| `e3` modal | `surface.raised` + shadow `#000000` opacity **0.55**, radius **28**, offset `{0,16}`, Android `elevation: 16` |
| `glow.accent` (special) | shadowColor `accent`, opacity **0.45**, radius **16**, offset `{0,0}` — **only** on the active primary CTA and the LIVE badge. Android fallback: 1.5px `accent` border (glow degrades; don't rely on it). |

### Light

| Level | shadowColor | opacity | radius | offset | Android elevation |
|---|---|---|---|---|---|
| `e0` flat | — | — | — | — | 0 |
| `e1` card | `#1B2536` | **0.06** | 8 | `{0,2}` | 2 |
| `e2` raised | `#1B2536` | **0.10** | 16 | `{0,6}` | 6 |
| `e3` modal | `#1B2536` | **0.14** | 28 | `{0,14}` | 14 |
| `glow.accent` | `#0B7D42` | **0.22** | 14 | `{0,0}` | (CTA only; subtle) |

---

## 8. Effects

**Gradients**
- `gradient.cta` (primary button, optional richness): `#1FCB6B → #16B85F` (dark) / `#0E8F4C → #0B7D42` (light), 180°.
- `gradient.live`: `#FF4D4D → #E5352E`, 135° — LIVE badges and live‑match hero rails.
- `gradient.premium` (secondary): `#8B5CF6 → #6D28D9`, 135° — XP/streak/premium moments only.
- `gradient.heroScrim`: bottom‑anchored `rgba(0,0,0,0) → rgba(0,0,0,0.78)` over 16:9 match heroes so overlaid title/LIVE text stays AA.

**Overlays / scrims**
- Modal/bottom‑sheet backdrop: `rgba(8,10,14,0.62)` (dark) / `rgba(20,23,28,0.45)` (light).
- Disabled overlay: `rgba(15,17,21,0.5)`.

**Blur / glassmorphism** — use sparingly via `expo-blur`: sticky top bar over scrolling hero uses `intensity 20` dark‑tint. Never blur behind wallet/token numbers (must stay crisp). Provide a solid‑color fallback for low‑end devices.

**Image aspect ratios** (enforced app‑wide)
- **16:9** — match cards, match detail hero, highlight/clip cards.
- **3:4** — esports‑team "box art" tiles in the Team Builder pool and team pages.
- **1:1 circle** — player avatars, the 12‑pick roster, user profile.

**Glow** — permitted only on: active primary CTA, LIVE badge, and the C/VC multiplier badge (secondary glow). Everywhere else, use borders/surfaces. Never glow a wallet number.

---

## 9. Motion & micro‑animations (Reanimated)

**Global tokens**

```
duration.instant = 100
duration.fast    = 160
duration.base    = 220
duration.slow    = 320
duration.celebrate = 500

easing.standard = Easing.bezier(0.2, 0, 0, 1)      // most transitions
easing.decel    = Easing.bezier(0, 0, 0, 1)        // entrances
easing.accel    = Easing.bezier(0.3, 0, 1, 1)      // exits
spring.snappy   = { damping: 18, stiffness: 220, mass: 0.9 }   // press/UI
spring.celebrate= { damping: 14, stiffness: 180, mass: 1 }     // rank/win
```

**Rule:** *Confirm around money, perform around glory.* Wallet interactions stay calm; leaderboard/win interactions get spring energy.

| Interaction | Spec |
|---|---|
| **Button press** | `scale 1 → 0.96`, `duration.instant`, `easing.standard`; release with `spring.snappy`. Haptic `light`. |
| **Tab switch** | Icon+label `scale 1 → 1.08 → 1` `duration.fast`; active‑color crossfade `160ms`; sliding pill indicator `spring.snappy`. |
| **Screen / route transition** | Push: incoming `translateX 24 → 0` + fade, `duration.base`, `easing.decel`. Modal/sheet: `translateY` from bottom, `spring.snappy`. |
| **Card entrance + list stagger** | Each card `opacity 0→1` + `translateY 12→0`, `duration.base`, `easing.decel`; stagger **40ms** per item, cap at 8 items. |
| **Pull‑to‑refresh** | Custom spinner = turf‑green arc that fills with pull distance; on release, brief `scale 1→1.1→1` then rotate loop `800ms` linear. |
| **JOIN success celebration** | Press `scale 0.96` → success check crossfade → **token‑fly**: a token chip animates along a bezier from the button into the wallet tab (`duration.celebrate`, `easing.accel`), wallet icon `scale 1→1.15→1` `spring.celebrate` + haptic `success`. |
| **Token‑balance count‑up/down** | Animated tabular number tween, `duration.slow` (400), `easing.standard`. Deduction on join counts *down* calmly (no color flash); winnings count *up* with a brief `success` tint. |
| **LIVE dot pulse** | Opacity `1 → 0.35 → 1` + `scale 1 → 1.25 → 1` loop, **1200ms**, `easing.inOut`. Single element only; respects reduce‑motion (falls back to static dot). |
| **Leaderboard rank change** | Reanimated `Layout` transition, `spring.celebrate` (stiffness 180, damping 14) so rows slide as you overtake; on *your* row overtaking, brief `accent.tint` background flash `320ms`. The emotional peak — the one place we spend motion generously. |
| **Captain / Vice‑Captain pick** | Badge fill `duration.fast` accent‑fill + `translateY 4→0` crossfade of the 2×/1.5× multiplier; `spring.snappy` badge pop; haptic `medium`. |
| **Error shake** | `translateX 0 → -8 → 8 → -5 → 0`, `duration.slow`, `easing.standard`; field border → `danger`; haptic `error`. |
| **Skeleton shimmer** | Gradient sweep `translateX -100% → 100%`, **1200ms** linear loop; shimmer over `surface.input` (dark) / `surface.sunken` (light). |

**Accessibility:** all looping/celebratory motion checks `AccessibilityInfo.isReduceMotionEnabled` and degrades to opacity‑only or static.

---

## 10. Core components

All reference tokens above. States: default / hover(pressed) / focused / disabled / loading.

### Button
- **Primary:** fill `accent`, label `text.onAccent` `label` type, `radius.pill`, height **48**, padding‑x `space.5`. Pressed → `accent.pressed` + `scale 0.96`. Loading → spinner replaces label, width locked. Disabled → `accent.disabled`. Active CTA may carry `glow.accent`.
- **Secondary:** transparent fill, 1.5px `border.default`, label `text.primary`. Pressed → `surface.input` (dark)/`surface.sunken` (light) fill.
- **Ghost:** no border, label `accent` (dark) / `accent.text` (light). Pressed → `accent.tint`.
- **Destructive:** fill `danger`, white label; used for irreversible actions (leave contest). Confirm via Alert.

### Card
- Bg `surface.card`, `radius.md`, padding `space.4`. Dark: `e1` (hairline border). Light: `e1` shadow. Pressable cards add `scale 0.98` press. Media‑topped cards clip image to ratio (16:9/3:4) with `radius.md` top corners.

### Bottom tab bar
- Bg `surface.raised`, top hairline `border.hairline`, height 56 + safe‑area. 4 tabs: Matches / My Contests / Wallet / Profile. Active: icon+label `accent` + sliding pill indicator; inactive: `text.faint`. Icons 24dp, label `caption` SemiBold. LIVE contests present → small `live` dot badge on Matches icon.

### Status pill / Badge
- `radius.pill`, height 24, padding‑x `space.2`, `label` type 11/SemiBold uppercase, +0.4 letter‑spacing.
- **Upcoming:** `info` text on `info@14%` tint.
- **LIVE:** `live` fill, white text, leading pulsing dot (see motion). Optional `glow.accent`→ use live‑red glow sparingly.
- **Completed:** `text.faint` text on `surface.input`/`surface.sunken`.
- **Joined:** `accent` text on `accent.tint` with a check glyph.

### Input / Field
- Bg `surface.input` (dark) / `surface.card` (light) + 1px `border.default`, `radius.sm`, height 48, `body` text, `text.faint` placeholder. Focus → `border.focus` (accent) 1.5px + subtle `accent.tint` inner. Error → `border` = `danger`, helper text `danger` `caption`, error‑shake. Label above in `label` type `text.secondary`.

### Segmented control
- Track `surface.sunken`/`surface.input`, `radius.pill`, height 40. Selected thumb `surface.card` (light) / `surface.raised` (dark) with `e1`; slides via `spring.snappy`. Labels `label` type; selected `text.primary`, rest `text.secondary`.

### List row
- Height ≥56, padding `space.3` vertical / `space.4` horizontal. Left: 1:1 avatar (40) or rank number (tabular Bold). Center: `title` name + `caption` meta. Right: point value / token value (tabular SemiBold `text.primary`). Divider `border.hairline` or 8px gap. Pressed → `surface.input`/`surface.sunken`. Team identity shown as a 8px role‑color dot beside the name — **never** a full‑row tint.

### Toast / Alert
- Toast: `surface.raised`, `radius.md`, `e2`, leading semantic icon (success=`accent`, error=`danger`, info=`info`), `body` text, auto‑dismiss 3s, enters `translateY` from top with `spring.snappy`. Inline alert banner: semantic `@14%` tint bg + 1px semantic border + matching‑color icon and title.

### Empty state
- Centered illustration/icon (secondary‑tinted), `title` headline + `body` `text.secondary` subline, one primary Button. Playful microcopy ("No contests yet — your squad's waiting. Build a team to get in the game."). Max width 320.

---

## 11. Iconography

- **Library:** `lucide-react-native` (Expo‑compatible, tree‑shakeable, rounded geometry that matches Manrope). One library only — no mixed sets.
- **Grid/size:** 24dp default; 20dp inline; 28dp tab/hero. Stroke **1.75–2px**, `strokeLinecap`/`join` = round.
- **Color:** inherit `text.secondary` by default; `accent` when active/selected; semantic colors for status. Never multicolor except brand mark.
- **Domain glyphs:** wallet/coin for E‑Tokens, trophy for contests, crown (C) / shield‑half (VC) for captaincy, broadcast/dot for LIVE, bar‑chart for leaderboard. Keep a single custom E‑Token coin glyph as the money mark everywhere.
- Every standalone icon button has an `accessibilityLabel`.

## 12. Accessibility

- **Contrast:** all text/surface and text/accent pairs ship at **≥4.5:1** for body, **≥3:1** for large (≥18px bold / 24px) and UI/graphics. Values verified above. `text.faint` is restricted to non‑essential metadata only.
- **Touch targets:** ≥48×48 dp; use hit‑slop for visually small chips.
- **Reduce motion:** honor `AccessibilityInfo.isReduceMotionEnabled` — disable LIVE pulse, shimmer, token‑fly, and rank‑spring (fall back to instant/opacity). Provide a Settings toggle too.
- **Don't encode meaning by color alone:** LIVE = red *plus* pulsing dot *plus* "LIVE" text; status pills always carry a label; team dots pair with team name.
- **Dynamic type:** support OS font scaling; use `allowFontScaling`, test to 130%; never truncate token/point values.
- **Screen readers:** semantic roles on Button/Tab/Input; announce leaderboard rank changes via `accessibilityLiveRegion="polite"`; label C/VC state ("Captain, 2x multiplier").
- **Focus:** visible `border.focus` (accent, 1.5px) on all interactive elements for keyboard/switch access.
- **Theme:** respect system light/dark by default with a manual override; both themes meet all criteria above.