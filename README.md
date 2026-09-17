# Yo-kai Watchle

Guess one fixed yo-kai a day by **name**. Once you hit the right answer, the yo-kai's rank, tribe and attribute are revealed — and every guess brings you closer to the real values.

[Play](https://spidychoipro.github.io/yokai-watchle/) · [GitHub](https://github.com/spidychoipro/yokai-watchle) · [한국어 README](./README_KO.md)

## How to play

Type a yo-kai name directly. Both the official Korean (정발) names and the English names from the Yo-kai Watch series are recognized.

- **Rank** — shows ▲ / ▼ whether it is higher or lower than the answer
- **Tribe / Attribute** — wrong guesses still reveal the yo-kai's real value in a colored cell
- A correct guess turns green and ends the game
- No guess limit. A different yo-kai appears every midnight (KST)

Names come from the database: Korean names (official/localized or fan translation) and English names are both accepted.

## Screenshots

![Today's yo-kai board](assets/screenshot-board.png)

![Mid-game guesses](assets/screenshot-gameplay.png)

![Correct! Medal and confetti](assets/screenshot-result.png)

![Settings — KR/EN toggle](assets/screenshot-settings-ko.png)

Rows flip in like cards, and a shine sweep passes over correct cells. Other than the linked web font (`Black Han Sans`) in the top-right buttons, every icon is an inline SVG.

## Playable roster

Pick a game and version based on the data-driven roster.

| Game | Versions | Entries |
|------|----------|---------|
| Yo-kai Watch | Main | 245 |
| Yo-kai Watch 2 | Main · Main 2 · Main 3 | 405 |
| Yo-kai Watch 3 (EN only) | Sushi · Tempura · Sukiyaki | 662 |
| Yo-kai Watch Busters | Red Cat · White Dog · Moon Rabbit | 392 · 392 · 368 |

Yo-kai Watch 3 was never officially released in Korea, so the Korean UI does not offer it — it is only selectable in English.

## Features

- **Today's yo-kai**: the target is tied to the KST date and changes at midnight.
- **Hint toggles**: rank, tribe and attribute columns can each be turned on or off.
- **Practice mode**: free-play against a random yo-kai from the current game/version. Wins and losses never touch the daily stats.
- **Game & version picker**: segmented chips sit on the board; the version row appears only when the selected game has multiple versions (Yo-kai Watch 3 is hidden in the Korean UI).
- **Statistics**: solved count, streak, best streak and the guess distribution. Winning the daily challenge counts once per day.
- **Share**: results are shared as text (🟩🟨⬜).
- **Sound effects**: WebAudio-synthesized sounds (click / wrong / win), toggleable in settings.
- **EN/KO**: both the UI and the game data (names, tribes, attributes) are translated; any series shows Korean or English names depending on your language setting.
- **Game availability per language**: Yo-kai Watch 3 (no official Korean release) is only offered in the English UI and auto-switches to Yo-kai Watch if you toggle to Korean.
- **Light / dark theme**: follows your device by default, with Auto / Light / Dark in settings.
- **Mascot**: an original "cat yo-kai" silhouette drawn as SVG (no Yo-kai Watch IP), used consistently in the header medal, result screen and favicon.

## How the data was built

All name data is collected and merged by scripts.

- **English / roster**: the Fandom Medallium Number lists are fetched by `tools/fetch-fandom.py` and `tools/scrape.mjs`, stored verbatim in `data/raw/`
- **Korean names**: Namuwiki-sourced material (`data/namu/`) plus `tools/parse-namu.py` and `tools/merge-kr.mjs` build `kr_pairs.json`
- **Validation / merge**: `tools/check-pairs.mjs` and `tools/merge-final.mjs` verify the pairs, then `build-data.mjs` regenerates `src/data.js` (a single file); `tools/compare-names.mjs` checks branches along the way
- **Busters** (Rev 5): `tools/blasters-parse.mjs` parses the Fandom raw into 470 entries, and `tools/blasters-kr.mjs` maps Korean names — 470/470

There are no external runtime dependencies; the static page reads the build artifact `src/data.js` directly.

## Repo structure

```
yokai-watchle/
├── src/                 # the game (index.html + style.css + app.js + data.js)
├── data/                # raw sources and intermediate output (raw / namu / out)
├── tools/               # data collection / merge / validation scripts (js / py)
├── assets/              # README screenshots
└── docs/                # PDCA working documents (plan / design / analysis / report)
```

## Run locally

No build step — just serve `src/` statically.

```bash
cd src
python -m http.server 8000
# http://localhost:8000
```

You only need to run the `tools/` pipeline when regenerating `src/data.js`.

## History

- **Rev 1** — first version: an NYT-style word guessing prototype
- **Rev 2~3** — stats, sharing, confetti, sound effects, collection dex, game/version selection and the language toggle
- **Rev 4** — medal-concept redesign (gold title, starfield background, sticker cards) after the "AI-made feel" critique; Yo-kai Watch 3 made English-only
- **Rev 5** — Yo-kai Watch Busters (Red Cat / White Dog / Moon Rabbit) data; Yo-kai Watch 3 blocked in the Korean build
- **Rev 6** — inline SVG icon set with the original cat-yo-kai mascot, purple-gold theme palette, tile-flip and answer-shine animations, full EN/KO translations
- **Rev 6.1** — Yo-kai Watch 3 re-enabled in Korean: the dataset has Korean names for all 662 entries
- **Rev 6.2** — a real 16-tooth gear icon and centered modal close buttons
- **Rev 6.3** — practice mode (daily stats untouched) and aligned settings selects; header top padding so the medal logo is never clipped
- **Rev 6.4** — Auto/Light/Dark theme that follows the device by default, localized brand title and game-select labels, corrected rank arrows, and help examples verified against the real DB entries
- **Rev 6.5** — Yo-kai Watch 3 blocked again in the Korean build (no official Korean release, with a forced switch to Yo-kai Watch when toggling to Korean); long Korean select labels like "요괴워치 버스터즈" no longer clip or crowd the chevron on narrow screens; rosters cross-checked against the raw medallium sources
- **Rev 6.6** — mobile optimization: a wider name column with tighter cards, header and cells for 320–400px screens (Korean names no longer clipped), stacked game/version selects on phones, and tap-highlight / double-tap-zoom prevention; the PC layout is unchanged
- **Rev 6.7** — moved game/version selection from settings to segmented chips on the board, removed the collection dex and the name autocomplete (no in-game yo-kai lookup), and simplified mode-info
- **Rev 6.7.1** — the header "DAILY" badge now switches to "PRACTICE" in practice mode, the board chip rows have "Game / Version" labels, and the "New Game" button only appears in practice mode (the daily challenge is once per day at midnight KST)

## License

Yo-kai Watch names and characters belong to Level-5. This is an unofficial fan project, and the mascot in the README images is an original design that does not use Yo-kai Watch assets. Distributed under the MIT license.