# Rock Cycle Explorer

A 3D cutaway of Earth’s crust for 7th-grade science (Amplify **Rock Transformations**).
Students follow one glowing grain of rock as it changes from one kind of rock to another.
Built for school iPads (Safari). It works the same on computers.

**Live site:** https://jdl2025.github.io/RockCycleSim/

Fourth in the family with Mars Explorer, Earth Explorer and Plate Motion Explorer (same look, same buttons).

## What students can do

| Part of the screen | What it does |
|---|---|
| **3D block** | Real photo textures on the ground and rock. Drag with one finger to turn it, pinch to zoom, drag with two fingers to move it. Mountains, river, delta, sea, volcano, lava flow, sedimentary layers, metamorphic rock, igneous rock and the glowing magma chamber. |
| **Menu bar (bottom)** | The 8 steps: Weathering & Erosion, Transport & Deposition, Compaction, Cementation, Heat & Pressure, Melting, Cooling Underground, Eruption. Tap one to watch the grain move. When the site opens, Weathering & Erosion glows green with a “Start here” tag. After each step, the next step along the main path (menu order; after Eruption it goes back to Weathering & Erosion) glows green with a “Next” tag. |
| **Message at the top** | Each step’s words appear as the animation reaches them, and **all of them stay on the screen** after the animation ends, until the next step starts. |
| **Color flashes** | Cementation, Heat & Pressure, Cooling Underground and Eruption end with a big color flash: “Sedimentary rock has now been made!” (green), “Metamorphic rock has now been made!” (purple), “Igneous rock has been created!” (red). The glowing grain turns the same color, so students can see the rock type change. |
| **Camera moves** | Transport & Deposition turns the block so the river and ocean show. Cementation zooms in to the buried layers, shows water seeping down with arrows, glows gold as the minerals glue the sediment, then zooms back out. |
| **Left side** | Labels on/off, Music, Help (How to explore, “Is this the real size?”, About & credits). |

## Modes (menu on the right)

**Real World Rock Cycle** is the default: everything above.

**Energy** asks: “Making different kinds of rocks requires ENERGY! Which kind of rock would you like to make?”
Each story has 4 parts. Students tap **Continue the Energy Journey** to go on. Touches can’t move the view while in space, but they can turn and zoom the block in the parts on Earth.

| Sedimentary (powered by the Sun) | Igneous (powered by Earth’s ancient heat) |
|---|---|
| 1. Zoom out to space; the Sun slides in and sends energy waves and arrows to Earth. | 1. Zoom out to space; space rocks crash together and build a swirling lava Earth, still being hit by asteroids. |
| 2. The energy hits the Pacific Ocean; the water steams into vapor. | 2. Earth cools: dark crust, then air, oceans filling in, clouds and green land. |
| 3. Fly down into the vapor to the 3D block; vapor rises off the sea, condenses into a cloud, and moves over the mountain (where the Weathering & Erosion cloud is). | 3. Earth is sliced open; thermometer tags show each layer’s temperature. |
| 4. The same Weathering & Erosion animation plays. “Powered by THE SUN!” | 4. Back to the block, zoomed in on the magma chamber, with red heat pulsing beneath it. |

The end buttons go to the other story or back to the Real World Rock Cycle. Layer temperatures come from National Geographic Education, Science News Explores and Physical Geology (2nd ed.), rounded for students.

## Updating later

Claude manages this repository for you. If you ever upload files yourself: **Add file → Upload files**, drag in the changed files (keep their folders), then **Commit changes**. Wait 1–2 minutes and reload on the iPad.

## Which file to edit for what

| To change… | Edit this file |
|---|---|
| Any words students read (the message at the top, the color flashes, the menu-bar buttons, the “Start here” / “Next” tags, the not-to-scale note) | `js/data/rockcycle.js` |
| Which word is yellow | `js/data/rockcycle.js` (put `*stars*` around the word) |
| The grain colors (and flash colors) | `js/data/rockcycle.js` (`rocks`) |
| All Energy mode words, the layer temperatures, the button words | `js/data/energy.js` |
| Songs, song names, music on/off at start | `js/data/music.js` |
| Label names on the block (Mountains, Volcano…) | `js/scene.js` (search for `LABELS`) |

Each data file starts with a plain-English guide. On GitHub, open the file, tap the pencil icon, change the words, then **Commit changes**. Keep the quote marks and commas.

## Things to know

- **Not to scale.** The magma chamber is really a few km (a few miles) down, and metamorphic rock usually forms 10–30 km (6–19 miles) deep. One magma chamber feeds both the igneous rock underground and the volcano, to keep it simple. This is in Help → “Is this the real size?”.
- **Saved on each iPad:** music on/off and the song. Nothing else is saved, and nothing leaves the iPad.
- **No internet services.** Everything (3D engine, fonts, textures, music) is in this repository, so school filters shouldn’t block it.
- **Sound:** music starts on the first tap (iPads require a tap). It pauses while Read to me talks.

## Credits

- Idea inspired by the SciSim 3D rock cycle simulation (scisim.org). Everything here was built new.
- Ground and rock photos: Poly Haven (polyhaven.com), CC0. Earth globe: NASA Blue Marble (public domain).
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
js/cycle.js           the rock cycle: the 8 steps, messages, color flashes, Next tags
js/energy.js          Energy mode: the two stories
js/space.js           the space scene: stars, Sun, Earth, space rocks
js/app.js             panels, pop-ups, celebration, music, Read to me
js/speech.js          Read to me
js/icons.js           icons
js/data/rockcycle.js  all the words (edit me)
js/data/music.js      songs (edit me)
js/data/energy.js     Energy mode words (edit me)
assets/tex/           ground and rock photo textures
assets/fonts/, lib/, music/   fonts, Three.js, songs
build_tools/          how the textures were made (not needed by the site)
```
