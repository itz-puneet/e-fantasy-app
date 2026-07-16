# Discord — Design System Reference

A concise, practical reference for Discord's brand and product design language, compiled
from Discord's official brand guidelines, blog posts, and support docs (see **Sources**).

> Note on scope: Discord publishes a **brand** palette (logo/marketing) publicly. The
> in-app **UI theme** greys below are community-documented from the product, not part of
> the official brand kit — they're included because they define Discord's recognizable look.

---

## 1. Brand essence

- **Personality:** playful, friendly, gaming-native, inclusive. Rounded, approachable, energetic.
- **Signature:** "**Blurple**" — a blue-purple hybrid — plus the Clyde mascot and speech-bubble logo.
- **2021 rebrand** brightened the palette (bolder, more playful) and shifted Blurple bluer
  (`#7289DA` → `#5865F2`) for better contrast/accessibility.

---

## 2. Color

### 2.1 Core brand palette (official, 2021+)

| Name          | Hex       | Typical use                                   |
|---------------|-----------|-----------------------------------------------|
| **Blurple**   | `#5865F2` | Logo, primary buttons, links, mentions, selected states |
| Light Blurple | `#E0E3FF` | Tints, backgrounds behind Blurple elements    |
| Green         | `#57F287` | Success, online status, positive actions      |
| Yellow        | `#FEE75C` | Highlights, idle status, attention            |
| Fuchsia       | `#EB459E` | Accents, playful highlights                   |
| Red           | `#ED4245` | Errors, destructive actions, DND status       |
| White         | `#FFFFFF` | Surfaces / text on dark                       |
| Black         | `#000000` | Maximum contrast / logo mono                  |

Blurple is the load-bearing brand color; the other four hues (green/yellow/fuchsia/red)
are used sparingly as functional and playful accents.

### 2.2 In-app dark theme (product UI — community-documented)

Discord's default (dark) interface is built on layered near-black greys, so content and
the Blurple accent pop.

| Role                         | Hex       |
|------------------------------|-----------|
| Darkest (server rail)        | `#1E1F22` |
| Secondary (channel sidebar)  | `#2B2D31` |
| Primary (chat area)          | `#313338` |
| Elevated (inputs / hover)    | `#383A40` |
| Accent / primary action      | `#5865F2` |
| Text — primary               | `#DBDEE1` |
| Text — muted / secondary     | `#949BA4` |

**Pattern:** three stacked dark surfaces (rail → sidebar → content) that get *lighter*
as they come forward, near-white primary text, and Blurple reserved for interactive/brand.

---

## 3. Typography

- **Primary typeface: `gg sans`** — Discord's custom sans-serif, rolled out from **Dec 2022**
  across app, web, and blog. Clean, geometric-humanist; the lowercase "g" nods to gaming
  ("gg" = *good game*).
- **Previous:** **Whitney** (body, 2017–2022) and **Uni Sans / Ginto** for display/marketing.
- **Weights (gg sans):** Light (300) · Regular (400) · Medium (500) · Semibold (600) · Bold (700) · Extrabold (800).

**Usage conventions**
- UI body text: Regular / Medium.
- Usernames, headings, buttons: Semibold / Bold for legibility on dark surfaces.
- Numerals and labels stay high-contrast (near-white on dark greys).

---

## 4. Iconography & illustration

- Rounded, friendly line/solid icons that match the geometric-humanist type.
- Heavy use of **custom illustration and mascots** (Clyde, Wumpus) — quirky, characterful.
- Emoji/reactions are first-class UI, not decoration.

---

## 5. Layout, shape & elevation

- **Rounded corners** everywhere (pills for tags/buttons, ~8px on cards/inputs) — soft, approachable.
- **Layered surfaces** convey hierarchy via lightness rather than heavy shadows (dark theme).
- Generous vertical rhythm in lists (messages, members) for scannability.
- Status is color-coded and consistent: green online · yellow idle · red DND · grey offline.

---

## 6. Themes

- Ships **Dark** (default), **Light**, and **Midnight/AMOLED**-style variants, plus Nitro custom themes.
- Brand palette stays constant; only neutral surfaces/text invert between themes.

---

## 7. Voice & tone

- Casual, witty, community-first ("a place to talk and hang out").
- Playful microcopy and empty states; never corporate-stiff.

---

## 8. Takeaways (if borrowing the vibe)

- Pick **one** bold signature accent (their Blurple) and use it *only* for brand + interactive elements.
- Build a **layered neutral scale** (3–4 surfaces) so content pops without heavy borders.
- Keep functional colors (success/warn/error/status) bright and consistent.
- Round everything a little; lean on a friendly geometric-humanist sans in a few weights.

---

## Sources

- [Discord — Official Brand Guidelines](https://discord.com/branding)
- [Discord Blog — "Happy Blurpthday" (2021 rebrand)](https://discord.com/blog/happy-blurpthday-to-discord-a-place-for-everything-you-can-imagine)
- [Discord Support — gg sans Font Update FAQ](https://support.discord.com/hc/en-us/articles/9507780972951-gg-sans-Font-Update-FAQ)
- [Discord Support — "A Fresh New Look" (6th birthday)](https://support.discord.com/hc/en-us/articles/1500009438682-A-Fresh-New-Look-to-Celebrate-Our-6th-Birthday)
- [Mobbin — Discord brand colors](https://mobbin.com/colors/brand/discord)
- [Theme & Color — Discord dark mode UI hex codes](https://themeandcolor.com/blog/discord-dark-mode-colors)

_Last compiled: 2026-07 · Values may change as Discord updates its brand._
