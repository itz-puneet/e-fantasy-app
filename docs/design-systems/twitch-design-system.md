# Twitch — Design System Reference

A concise, practical reference for Twitch's brand and product design language, compiled
from Twitch's brand site, engineering/blog posts, and typography sources (see **Sources**).

> Note on scope: Twitch's **brand** primary is published publicly. The full **extended
> palette** (its game-named colors) and the internal grey/purple ramps live inside Twitch's
> **Core UI** system and aren't fully published as hex lists — those are described rather
> than enumerated below. In-app **UI theme** greys are community-documented from the product.

---

## 1. Brand essence

- **Personality:** bold, playful, community-driven, "keeping it real." Rounded but confident.
- **Signature:** "**Ultraviolet**" purple. The 2019 TwitchCon rebrand ("Beyond Purple")
  made purple the foundation of everything and introduced the Roobert typeface + 200+ icons.
- **Design system:** **Core UI → "Core UI Ultraviolet"** — components in **Figma + TypeScript**,
  built accessibility-first (AA contrast) via a "Product Experience Framework."

---

## 2. Color

### 2.1 Primary brand color

| Name              | Hex       | RGB              | HSL              |
|-------------------|-----------|------------------|------------------|
| **Twitch Purple** (Ultraviolet) | `#9146FF` | `rgb(145, 70, 255)` | `hsl(264, 100%, 63%)` |

Legacy purples (pre-2019, for reference only): `#6441A4` / `#6441A5`.

### 2.2 Supporting brand hues (published)

| Name         | Hex       | Use                          |
|--------------|-----------|------------------------------|
| Ice / Light  | `#F0F0FF` | Light tints, backgrounds     |
| Pink / Lilac | `#FAB4FF` | Playful secondary accent     |
| White        | `#FFFFFF` | Surfaces / text on purple    |
| Black        | `#000000` | Mono / max contrast          |

### 2.3 Extended palette (described, not fully published)

The rebrand added **~24 accent colors named after games & pop-culture characters** — e.g.
**"Pac"** (yellow), **"Wipe Out"** (teal), **"Sonic"** (blue). Internally the system also
maintains **15 grey + 15 purple ramps**, each following a consistent lightness curve at a
fixed hue, with matched **light and dark** themes. A **"creator color token"** lets each
streamer surface their own accent color across their channel.

### 2.4 In-app dark theme (product UI — community-documented)

Twitch's product is **dark-first**: near-black surfaces so purple and thumbnails pop.

| Role                     | Hex       |
|--------------------------|-----------|
| Base background          | `#0E0E10` |
| Elevated surface / cards | `#18181B` |
| Raised / hover           | `#1F1F23` |
| Border / divider         | `#2A2A2D` |
| Accent / primary action  | `#9146FF` |
| Text — primary           | `#EFEFF1` |
| Text — secondary/muted   | `#ADADB8` |

---

## 3. Typography

- **Brand typeface: `Roobert`** — a mono-linear geometric sans by **Displaay** (Martin Vácha),
  adopted Sept 2019. It "blends the squareness of Eurostyle and the curvature of Avant Garde."
- **Weights:** 6 weights + matching italics — **Light → Regular → Medium → SemiBold → Bold → Black**.
- **UI fallback:** **Inter** / system sans is used in some product/chat contexts where Roobert
  isn't loaded.

**Usage conventions**
- Display / headings / brand moments: Roobert, heavier weights (SemiBold–Black).
- Body & chat: Regular / Medium.
- The type's rounded-but-sharp character is echoed by the icon set.

---

## 4. Iconography

- **200+ custom icons**, unified between mobile and web.
- Style: "**sharp edges and soft lines**" — deliberately matched to Roobert's geometry
  (whimsical, rounded, confident).

---

## 5. Layout, shape & media ratios

Scannability is a core principle — content shapes are distinctive and consistent:

| Content type | Aspect / shape |
|--------------|----------------|
| Media (streams, thumbnails, clips) | **16:9** |
| Categories / games | **3:4** (portrait box art) |
| People / avatars   | **1:1 circle** |

- Rounded corners on cards/buttons; pill-shaped tags and the follow/subscribe CTAs.
- Purple reserved for primary actions (Follow, Subscribe) and active/live indicators.
- "**LIVE**" and viewer counts use a bold red/accent treatment for at-a-glance status.

---

## 6. Themes & accessibility

- **Dark theme is default**; a light theme exists with the same hue curves.
- Accessibility is foundational: targets **AA contrast ratios**, distinct shapes for scannability,
  and inclusive design "as a foundation rather than an afterthought."

---

## 7. Voice & tone

- Energetic, insider, community-native; embraces internet/streaming culture and memes.
- "Keeping Twitch real" — authentic over polished-corporate.

---

## 8. Takeaways (if borrowing the vibe)

- Anchor on **one saturated purple** for brand + primary actions; keep it consistent everywhere.
- Go **dark-first** with layered near-black surfaces; let media thumbnails and the accent carry color.
- Enforce **consistent media aspect ratios** (16:9 / 3:4 / 1:1) — it's a big part of the recognizable feel.
- Use a **geometric sans in several weights** and an icon set drawn to match it.
- Consider a **per-creator/per-entity accent token** if your product has user-owned spaces.

---

## Sources

- [Twitch Brand site](https://brand.twitch.tv/brand/) · [Brand assets](https://brand.twitch.com/)
- [Twitch Blog — "Beyond Purple" (2019 rebrand)](https://blog.twitch.tv/en/2019/12/03/beyond-purple/)
- [Icons8 — Twitch Purple #9146FF](https://icons8.com/colors/twitch-purple)
- [DesignYourWay — What font does Twitch use? (Roobert)](https://www.designyourway.net/blog/what-font-does-twitch-use/)
- [Loftlyy — Twitch brand colors, font & logo](https://www.loftlyy.com/en/twitch)

_Last compiled: 2026-07 · Values may change as Twitch updates its brand._
