# Rock Cycle Explorer

A 3D cutaway of Earth’s crust for 7th-grade science (Amplify **Rock Transformations**).
Students follow one glowing grain of rock as it changes from one kind of rock to another.
Built for school iPads (Safari). It works the same on computers.

**Live site:** https://jdl2025.github.io/RockCycleSim/

Fourth in the family with Mars Explorer, Earth Explorer and Plate Motion Explorer (same look, same buttons).

## What students can do

| Part of the screen | What it does |
|---|---|
| **3D block** | Real photo textures on the ground and rock. Drag with one finger to turn it, pinch to zoom, drag with two fingers to move it. Mountains, river, delta, sea, volcano, lava flow, sedimentary layers, metamorphic rock, granite and the glowing magma chamber. |
| **Menu bar (bottom)** | The 8 processes: Weathering & erosion, Transport & deposition, Compaction & cementation, Heat & pressure, Melting, Cooling underground, Eruption (lava cools), Uplift. Tap one to watch the grain move. Processes that can happen **next** glow green with a “Next” tag. |
| **A Rock’s Journey** | A pop-up, then a surprise 8-step trip around the rock cycle. Each step is listed on the card. Confetti at the end. |
| **Rock card (right, or bottom on a tall screen)** | “The grain is now …”, Where, Temperature, the process (short sentences), How long it takes, Energy (Sun, Earth’s hot inside, gravity, plate motion), and “What can happen next?” buttons. **Read to me** reads it aloud. ✕ makes it small. |
| **Pause / Speed / Replay** | Under the card. Speed goes 1× → 2× → ½×. |
| **View (left)** | Cross-section, Tilted, From above, Labels on/off, Music, Help. |
| **Help** | How to explore, “Is this the real size?” (the not-to-scale note), About & credits. |
| **Effects** | Rain cloud (weathering), sediment in the river, arrows pressing down (compaction), squeezing arrows and a heat glow (heat & pressure), glowing melt, cooling sparkles, lava fountain + ash cloud + a glowing lava flow that cools (eruption), a rising column (uplift). |

If a student taps a process that can’t happen to the rock right now, the grain jumps to a rock it can happen to, and a message says so.

## Updating later

Claude manages this repository for you. If you ever upload files yourself: **Add file → Upload files**, drag in the changed files (keep their folders), then **Commit changes**. Wait 1–2 minutes and reload on the iPad.

## Which file to edit for what

| To change… | Edit this file |
|---|---|
| Any words students read (rock names, Where, Temperature, process sentences, How long, Energy, the journey pop-up, the not-to-scale note) | `js/data/rockcycle.js` |
| Which processes can happen next to each rock | `js/data/rockcycle.js` (`next`) |
| Songs, song names, music on/off at start | `js/data/music.js` |
| Label names on the block (Mountains, Volcano…) | `js/scene.js` (search for `LABELS`) |

Each data file starts with a plain-English guide. On GitHub, open the file, tap the pencil icon, change the words, then **Commit changes**. Keep the quote marks and commas.

## Things to know

- **Not to scale.** The magma chamber is really a few km (a few miles) down, and metamorphic rock usually forms 10–30 km (6–19 miles) deep. One magma chamber feeds both the granite and the volcano, to keep it simple. This is in Help → “Is this the real size?”.
- **Saved on each iPad:** music on/off, the song, whether the help box was seen, and whether the card is small. Nothing else is saved, and nothing leaves the iPad.
- **No internet services.** Everything (3D engine, fonts, textures, music) is in this repository, so school filters shouldn’t block it.
- **Sound:** music starts on the first tap (iPads require a tap). It pauses while Read to me talks.
- `?nohelp` at the end of the address skips the first-time help box.

## Credits

- Idea inspired by the SciSim 3D rock cycle simulation (scisim.org). Everything here was built new.
- Ground and rock photos: Poly Haven (polyhaven.com), CC0.
- Music: Kevin MacLeod (incompetech.com), CC BY 4.0.
- Three.js (MIT). Fonts: Atkinson Hyperlegible, Big Shoulders Display (SIL OFL).

## Files

```
index.html            the page
css/app.css           all styles (family look)
js/main.js            starts everything
js/scene.js           the 3D block, effects, labels, touch controls
js/glsl.js            shaders (ground, rock faces, sea, river)
js/geo.js             the shape of the land and the grain's paths
js/cycle.js           the rock cycle: processes, card, journey
js/app.js             panels, pop-ups, celebration, music, Read to me
js/speech.js          Read to me
js/icons.js           icons
js/data/rockcycle.js  all the words (edit me)
js/data/music.js      songs (edit me)
assets/tex/           ground and rock photo textures
assets/fonts/, lib/, music/   fonts, Three.js, songs
build_tools/          how the textures were made (not needed by the site)
```
