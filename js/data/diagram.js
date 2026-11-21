/* =====================================================================
   ROCK CYCLE DIAGRAM WORDS — everything students read in Diagram mode.
   You can change any words here.
   (On GitHub: open this file, tap the pencil icon, edit, then
   "Commit changes". Keep the quote marks and commas as they are.)

   Put *stars* around words to color them. Rock names are colored with
   their rock's color (sedimentary = green, metamorphic = purple,
   igneous = red, magma = orange, sediment = yellow). Other starred
   words are yellow.

   rocks       The 5 boxes: name, color, and "about" (shown when a
               student taps the box). "hint" is shown in the quiz when a
               student puts that name in the wrong box.
   processes   The 5 arrow pictures: name and color.
   arrows      The 10 arrows (which box they go from and to). These match
               the assessment diagram. Each arrow's place on the screen
               is set in js/diagram.js.
   lesson      The guided lesson: the Big Circle (5 steps), then the
               Shortcuts (3 rules), then the end.
   quiz        The drag-and-drop quiz (4 rounds) and its score screen.
   ===================================================================== */
window.DIAGRAM = {
  button: 'Rock Cycle Diagram',
  hud: 'Diagram mode: follow the rock around the circle!',
  quizHud: 'Diagram quiz: finish the rock cycle diagram!',

  rocks: {
    sediment:    { name: 'Sediment',         color: '#ffe082', about: 'Sediment is small pieces of rock, like sand, pebbles and mud.',               hint: 'Sediment is loose pieces of rock, like sand and pebbles.' },
    sedimentary: { name: 'Sedimentary Rock', color: '#3ddc84', about: 'Sedimentary rock is made of layers of sediment, pressed and glued together.', hint: 'Sedimentary rock has flat layers, like a stack of pancakes.' },
    metamorphic: { name: 'Metamorphic Rock', color: '#b16cff', about: 'Metamorphic rock is rock that was changed by heat and pressure, without melting.', hint: 'Metamorphic rock has wavy, squeezed bands.' },
    magma:       { name: 'Magma',            color: '#ff9a3c', about: 'Magma is melted rock — liquid rock — deep underground.',                       hint: 'Magma is hot, glowing, liquid rock.' },
    igneous:     { name: 'Igneous Rock',     color: '#ff3b3b', about: 'Igneous rock is made when magma cools and hardens.',                            hint: 'Igneous rock has speckled crystals.' }
  },

  processes: {
    weather: { name: 'Weathering and Erosion',   color: '#4fc3f7' },   // sky blue, wispy wind
    compact: { name: 'Compacting and Cementing', color: '#3ddc84' },   // green, pressed layers and glue
    heatp:   { name: 'Heat and Pressure',        color: '#ffd84d' },   // yellow, squeezing heat
    melt:    { name: 'Melting',                  color: '#ff9a3c' },   // orange, flames
    cool:    { name: 'Cooling',                  color: '#9ff0ff' }    // icy blue, frost
  },

  // the Big Circle: w1, c1, h1, m1, k1.  The shortcuts: w2, w3, h2, m2, m3.
  arrows: {
    w1: { from: 'igneous',     to: 'sediment',    process: 'weather' },
    c1: { from: 'sediment',    to: 'sedimentary', process: 'compact' },
    h1: { from: 'sedimentary', to: 'metamorphic', process: 'heatp' },
    m1: { from: 'metamorphic', to: 'magma',       process: 'melt' },
    k1: { from: 'magma',       to: 'igneous',     process: 'cool' },
    w2: { from: 'sedimentary', to: 'sediment',    process: 'weather' },
    w3: { from: 'metamorphic', to: 'sediment',    process: 'weather' },
    h2: { from: 'igneous',     to: 'metamorphic', process: 'heatp' },
    m2: { from: 'sedimentary', to: 'magma',       process: 'melt' },
    m3: { from: 'igneous',     to: 'magma',       process: 'melt' }
  },

  lesson: {
    intro: {
      step: 'The Rock Cycle Diagram',
      text: 'Rocks are always slowly changing from one kind into another. This is called the *rock cycle*. Let’s follow one piece of *igneous rock* all the way around!'
    },
    circleStep: 'The Big Circle · Step {n} of {total}',
    circle: [
      { arrow: 'w1', text: 'Wind and rain break down *igneous rock* into small pieces called *sediment*.' },
      { arrow: 'c1', text: 'Layers of sediment are squeezed together. Then minerals cement (glue) the pieces together. This makes *sedimentary rock*!' },
      { arrow: 'h1', text: 'Sedimentary rock moves deeper, and is heated and squeezed by tremendous pressure. This turns it into *metamorphic rock*!' },
      { arrow: 'm1', text: 'When rock is heated up enough, it melts and turns into *magma* — liquid rock.' },
      { arrow: 'k1', text: 'Magma cools and hardens into *igneous rock*. This can happen underground, or on the surface after an eruption. Full circle!' }
    ],
    shortcutStep: 'Shortcuts · Rule {n} of {total}',
    shortcuts: [
      { arrows: ['w2', 'w3'], text: '*Any* rock on the surface can be broken down by weathering and erosion. So *sedimentary rock* and *metamorphic rock* can turn into *sediment*, too!' },
      { arrows: ['h2'],       text: '*Any* rock deep underground can be heated and squeezed. So *igneous rock* can turn into *metamorphic rock*, too!' },
      { arrows: ['m2', 'm3'], text: '*Any* rock can melt if it gets hot enough. So *sedimentary rock* and *igneous rock* can melt into *magma*, too!' }
    ],
    end: {
      step: 'You did it!',
      text: 'You learned the whole rock cycle diagram! Tap any rock or arrow picture to see it again.'
    },
    buttons: { start: 'Start', next: 'Next', quiz: 'Take the Diagram Quiz', again: 'Watch it again', back: 'Back to the Real World Rock Cycle' }
  },

  quiz: {
    title: 'Diagram Quiz',
    roundStep: 'Diagram Quiz · Round {n} of 4',
    rounds: [
      { chips: ['sedimentary', 'metamorphic', 'igneous'], text: 'Drag each rock name onto its picture.' },
      { chips: ['sediment'], text: 'Where does *sediment* go? Drag it onto its picture.' },
      { chips: ['magma'], text: 'Now place *magma*.' },
      { chips: ['weather', 'compact', 'heatp', 'melt', 'cool'], text: 'Drag the process names onto the arrow pictures. You can use each name more than once!' }
    ],
    tip: 'Tip: you can also tap a name, then tap where it goes.',
    right: 'Correct!',
    wrong: 'Not quite.',
    tryAgain: 'Try again!',
    roundDone: 'Great job! Round complete!',
    // hints for the arrows, by the process that belongs there
    processHints: {
      weather: 'This arrow ends at sediment. What breaks rock into small pieces?',
      compact: 'This arrow turns sediment into sedimentary rock. What presses and glues the pieces together?',
      heatp: 'This arrow ends at metamorphic rock. What changes rock deep underground without melting it?',
      melt: 'This arrow ends at magma. What turns rock into liquid rock?',
      cool: 'This arrow turns magma into igneous rock. What makes magma harden?'
    },
    scoreTitle: 'Your score',
    perfectTitle: 'Perfect score!',
    perfectSub: 'You completed the whole diagram on the first try!',
    goodJob: 'Good work! Try again to get a perfect score.',
    outOf: 'out of',
    firstTry: 'right on the first try',
    again: 'Take the quiz again',
    done: 'Done'
  }
};
