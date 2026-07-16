# Screenshots

The `.svg` files here are **on-brand design previews** of the app, used in the main
[README](../../README.md). They render on GitHub without needing a device.

## Replacing them with real screenshots (recommended)

Real device captures make the strongest impression. To swap them in:

1. Run the app (`npx expo start --clear`) and open it in **Expo Go**.
2. Take screenshots on your phone of the key screens.
3. Save them into this folder, overwriting (or renaming) as:
   - `matches.png` — the Matches home screen
   - `team.png` — the team builder
   - `leaderboard.png` — a live leaderboard
4. In the main `README.md`, update the image `src` paths from `.svg` to your `.png`
   filenames (e.g. `docs/screenshots/matches.png`).

**Tips**
- Keep all screenshots the same aspect ratio (portrait) so the table stays even.
- PNG or JPG both render reliably on GitHub.
- A width of ~240px per image in the README table keeps the three side by side.
