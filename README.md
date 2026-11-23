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
| **Menu bar (bottom)** | The 8 steps: Weathering & Erosion, Transport & Deposition, Compaction, Cementation, Heat & Pressure, Melting, Cooling Underground, Eruption. Tap one to watch the grain move. Each step starts by moving the camera to the best view for that step (students can still turn and zoom while it plays). Each button has its own outline color (blue, teal, green, lime, yellow, orange, red, pink, and purple for the Quiz). When the site opens, Weathering & Erosion glows in its color with a “Start here” tag. After each step, the next step along the main path (menu order; after Eruption comes the Quiz, then back to Weathering & Erosion) glows with a “Next” tag. The Quiz button always has a “Last” tag. |
| **Message at the top** | Each step’s words appear as the animation reaches them, and **all of them stay on the screen** after the animation ends, until the next step starts. |
| **Color flashes** | Cementation, Heat & Pressure, Cooling Underground and Eruption end with a big color flash: “Sedimentary rock has now been made!” (green), “Metamorphic rock has now been made!” (purple), “Igneous rock has been created!” (red). The glowing grain turns the same color, so students can see the rock type change. |
| **Camera moves** | Transport & Deposition turns the block so the river and ocean show. Cementation zooms in to the buried layers, shows water seeping down with arrows, glows gold as the minerals glue the sediment, then zooms back out. |
| **Left side** | Labels on/off, Music, Help (How to explore, “Is this the real size?”, About & credits). |

## Quizzes

- **Rock Cycle Quiz (8 questions):** the **Quiz** button at the end of the menu bar (tagged “Last”). After Eruption, it glows to show it’s next. Neon purple. The quiz sits on the right and the 3D model stays in view on the left (smaller, no labels; on tall screens the model is on top). Students can still turn and zoom it.
- **Sun Energy Quiz and Earth’s Heat Quiz (3 questions each):** the **Take the Quiz** button at the end of each Energy story. Neon orange (Sun) and neon pink (Earth’s heat).
- Each quiz box has a softly pulsing glow in its color.
- Students tap an answer and find out right away. A wrong answer explains why it’s wrong, and they try again. A second wrong answer explains why, then shows the right answer and why it’s right.
- The score screen counts answers that were right on the first try, with a big colorful percentage next to the score, and lists every question (first try / second try / missed). A perfect score plays fireworks.
- All questions, answers and explanations are in `js/data/quizzes.js`.

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

**Rock Cycle Diagram** is a classroom-style rock cycle diagram, with the 5 boxes in the same places as the class assessment diagram (Metamorphic Rock on top, Sedimentary Rock left, Magma right, Sediment bottom-left, Igneous Rock bottom-right) and the same 10 arrows. Each box has a picture (sediment = pebbles and sand, sedimentary = layers, metamorphic = wavy bands, igneous = dark, glassy rock like obsidian or basalt, with light speckles, magma = glowing liquid rock) and the site's rock colors.

- **The Big Circle (5 steps):** a glowing grain rides each arrow clockwise: Weathering and Erosion → Compacting and Cementing → Heat and Pressure → Melting → Cooling, back to igneous rock. Boxes and arrows stay grey until students reach them.
- **Checkpoint questions:** after steps 2, 4, 6 and 8, a multiple choice or True/False question pops up (each in a different color) when students tap Next. They must answer to go on. Edit them in `js/data/diagram.js` (`checkpoints`).
- **The Shortcuts (3 rules):** *any* rock on the surface can be weathered (sedimentary → sediment, metamorphic → sediment); *any* rock deep underground can be heated and squeezed (igneous → metamorphic); *any* rock can melt (sedimentary → magma, igneous → magma).
- Each process has its own moving arrow: sky-blue wispy wind (weathering), green pressed layers with glue drops (compacting and cementing), yellow squeezing chevrons with heat glow (heat and pressure), orange flickering flames (melting), icy-blue jagged frost with twinkling crystals (cooling).
- After the lesson, students can tap any box or arrow picture to see it again.
- **Diagram Quiz (neon teal):** first drag and drop in 4 rounds: ① the 3 rock types ② Sediment ③ Magma ④ the 10 arrows, using 5 process names that can be used more than once. The pieces students can drag glow and pulse. Students can drag a name, or tap a name and then tap the spot. A wrong answer shakes and opens a hint pop-up in a new color each time.
  - A counter shows “7/15 completed”. It changes color and flashes at 5, 10 and 15. After 5 right in a row, a pulsing 🔥 “Streak of 5!” appears and keeps counting until a wrong answer.
  - When the diagram is finished: fireworks and a gold flash behind the diagram, then 5 multiple choice questions (2 simple, 2 harder, and a final True/False: “Any kind of rock can become any other kind of rock…”).
  - The score counts all 20 (15 diagram pieces + 5 questions) right on the first try, with a big percentage, the two parts listed, and fireworks for a perfect score.
- The 3D model rests (isn't drawn) while the diagram is showing, to save iPad battery.

**Rock Types** (unlocks after passing the Diagram Quiz): 12 glowing crystals, each a different color and shape, sit on the 3D model where that rock really forms (obsidian and pumice on the volcano, basalt in the lava flow, granite in the igneous rock that cooled underground, sandstone under the river plain, limestone under the sea, coal in an old swamp layer, rock salt where an old sea dried up, marble/slate/gneiss/quartzite in the squeezed metamorphic rock).

- Tap a crystal: a pop-up with a real photo, the kind of rock, how it forms, what it starts as (metamorphic rocks), where it's found, what it's used for, and a wow fact, with Read to me.
- Then the crystal becomes a little cartoon rock (“Drag me!”). The 3 category boxes (Igneous, Sedimentary, Metamorphic) rise up at the bottom. A right drop flashes gold and the rock stays in the box with its name. A wrong drop flashes red, shakes, opens a hint pop-up, and the rock flies back. One rock at a time: the other crystals wait until it's sorted.
- After all 12 (“12/12 sorted”): fireworks, then the **Rock Types Quiz** (neon lime): a grid of all 12 photos; tap 2 rocks of each kind (6 questions), pass with 4 of 6. Students can tap any sorted rock to read about it again, retake the quiz, or start over.
- The 12 rocks: granite, basalt, obsidian, pumice (igneous); sandstone, limestone, coal, rock salt (sedimentary); marble, slate, gneiss, quartzite (metamorphic). Photos from Wikimedia Commons (credits on the About page and in `js/data/rocktypes.js`).

## Progress and unlocking

Modes unlock in order, so students work through the lesson as a progression:

| Mode | Unlocks when… |
|---|---|
| Real World Rock Cycle | always open. Its **Quiz** button unlocks after all 8 steps have been played all the way through (any order). |
| Energy | the student passes the **Rock Cycle Quiz** (6 of 8 right on the first try) |
| Rock Cycle Diagram | the student passes **both** Energy quizzes (3 of 4 each) |
| Rock Types | the student passes the **Diagram Quiz** (14 of 20) |

- The Diagram Quiz passes at 14 of 20. Each milestone quiz starts with a **“Get ready!”** pop-up that says the score needed and what passing unlocks. The score screen says “You passed!” or how many are needed, announces anything newly unlocked, and has a **My Progress** button. Retakes mix up the answer order (not True/False).
- Locked modes and the locked Quiz button show a 🔒. Tapping them explains what to do. A newly unlocked mode glows until it’s opened. Students can always go back to modes they have unlocked. Steps played get a small ✓ in the menu bar.
- **My Progress** (left menu): a progress bar for the 8 milestones (all 8 steps, each story and lesson, each quiz passed), the 8 step dots, and for each quiz the best score, last try and number of tries. The best score only goes up.
- **Unlock all** (left menu, for the teacher): type the teacher password. It is kept private and is not written in these files (only a scrambled form is in `js/progress.js`). It unlocks every mode and quiz on that iPad (the button turns green), and has **Lock again** and **Erase this iPad’s progress** for testing.
- Progress is saved on each iPad. **Add to Home Screen** (in Help) shows step-by-step instructions. iPads don’t let a website add itself, and the Home Screen app keeps its own progress, separate from Safari, so students should add it first and always open it from the icon.
- Pass scores: `js/data/quizzes.js` and `js/data/diagram.js` (`pass`). All the words: `js/data/progress.js`.

## Updating later

Claude manages this repository for you. If you ever upload files yourself: **Add file → Upload files**, drag in the changed files (keep their folders), then **Commit changes**. Wait 1–2 minutes and reload on the iPad.

## Which file to edit for what

| To change… | Edit this file |
|---|---|
| Any words students read (the message at the top, the color flashes, the menu-bar buttons, the “Start here” / “Next” tags, the not-to-scale note) | `js/data/rockcycle.js` |
| Which word is yellow | `js/data/rockcycle.js` (put `*stars*` around the word) |
| The grain colors (and flash colors) | `js/data/rockcycle.js` (`rocks`) |
| The starting camera view for each step | `js/cycle.js` (`STEP_VIEWS`, near the top) |
| Menu-bar button colors and the “Last” tag | `js/data/rockcycle.js` (`buttonColors`, `lastTag`) |
| Quiz colors (purple / orange / pink) | `js/data/quizzes.js` (`theme`) |
| All Energy mode words, the layer temperatures, the button words | `js/data/energy.js` |
| All Rock Cycle Diagram words, rock and arrow colors, the Diagram Quiz | `js/data/diagram.js` |
| Quiz questions, answers and explanations | `js/data/quizzes.js` |
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
js/energy.js          Energy mode: the two stories (and switching modes)
js/diagram.js         Rock Cycle Diagram mode: the diagram, lesson and drag-and-drop quiz
js/space.js           the space scene: stars, Sun, Earth, space rocks
js/quiz.js            the quizzes (two tries, score screen)
js/app.js             panels, pop-ups, celebration, music, Read to me
js/speech.js          Read to me
js/icons.js           icons
js/data/rockcycle.js  all the words (edit me)
js/data/music.js      songs (edit me)
js/data/energy.js     Energy mode words (edit me)
js/data/quizzes.js    quiz questions (edit me)
js/data/diagram.js    Rock Cycle Diagram words and quiz (edit me)
js/data/progress.js   My Progress, unlocking and Home Screen words (edit me)
js/data/rocktypes.js  Rock Types facts, photo credits and quiz (edit me)
js/rocks.js           Rock Types mode: crystals, pop-ups, sorting boxes, quiz
assets/rocks/         the 12 rock photos
js/progress.js        saved progress, locks, My Progress, Unlock all
manifest.webmanifest  Home Screen app name and icon
assets/tex/           ground and rock photo textures
assets/fonts/, lib/, music/   fonts, Three.js, songs
build_tools/          how the textures were made (not needed by the site)
```
