/* =====================================================================
   ROCK CYCLE WORDS — everything students read: the menu bar and the
   message at the top of the screen.
   You can change any words here.
   (On GitHub: open this file, tap the pencil icon, edit, then
   "Commit changes". Keep the quote marks and commas as they are.)

   Put *stars* around a word to make it yellow (like *rock*).

   steps       The 8 steps in the menu bar, in order.
     button      the words on the menu-bar button
     name        the step's name (shown in bold at the top of the screen)
     text        the message at the top of the screen. Each line shows
                 up as the animation reaches it, and ALL lines stay on
                 the screen after the animation ends.
     made        (only some steps) the big color flash at the end,
                 like "Igneous rock has been created!"
     from        which kinds of rock this step can start from. If the
                 grain is something else, it hops to the first one.
     to          what the grain becomes

   rocks       What the grain can be, and the color of the glowing grain.
               The flash for each new kind of rock uses the same color:
               sedimentary = green, metamorphic = purple, igneous = red.

   startTag    The label on the first step when the site opens.
   nextTag     The label on the next step along the main path
               (the menu-bar order; after Eruption comes the Quiz,
               then back to Weathering & Erosion).
   lastTag     The label that always sits on the Quiz button.
   buttonColors  The outline and glow color of each menu-bar button.
   scale       The "Is this the real size?" box (Help button).
   ===================================================================== */
window.ROCK_CYCLE = {
  startTag: 'Start here',
  nextTag: 'Next',
  lastTag: 'Last',
  buttonColors: {
    weather: '#4fc3f7',       // sky blue
    transport: '#2dd4bf',     // teal
    compact: '#3ddc84',       // green
    cement: '#c6f432',        // lime
    heatp: '#ffd84d',         // yellow
    melt: '#ff9a3c',          // orange
    cool: '#ff5a5a',          // red
    erupt: '#ff5ab4',         // pink
    quiz: '#b16cff'           // purple
  },
  start: 'surface',           // the grain starts as rock on the mountain

  steps: {
    weather: {
      button: 'Weathering & Erosion', name: 'Weathering & Erosion',
      text: ['Wind and rain break down *rock* into *sediment*.'],
      from: ['surface', 'ignOut'], to: 'sediment'
    },
    transport: {
      button: 'Transport & Deposition', name: 'Transport & Deposition',
      text: ['Wind and water move the sediment.', 'The sediment has reached the ocean.'],
      from: ['sediment'], to: 'deposit'
    },
    compact: {
      button: 'Compaction', name: 'Compaction',
      text: ['Layers of sediment are laid down over a long time.', 'Gravity squeezes the layers together.'],
      from: ['deposit'], to: 'compacted'
    },
    cement: {
      button: 'Cementation', name: 'Cementation',
      text: ['Water seeps down through the rock, bringing minerals with it.', 'These minerals cement (glue) the sediment together.'],
      made: 'Sedimentary rock has now been made!',
      from: ['compacted'], to: 'sedrock'
    },
    heatp: {
      button: 'Heat & Pressure', name: 'Heat & Pressure',
      text: ['Sedimentary rock moves deeper, and is heated and squeezed by tremendous pressure.', 'This turns it into metamorphic rock!'],
      made: 'Metamorphic rock has now been made!',
      from: ['sedrock'], to: 'meta'
    },
    melt: {
      button: 'Melting', name: 'Melting',
      text: ['When rock is heated up enough, it melts and turns into magma — liquid rock.'],
      from: ['meta', 'sedrock', 'ignIn'], to: 'magma'
    },
    cool: {
      button: 'Cooling Underground', name: 'Cooling Underground',
      text: ['Sometimes magma cools and hardens while still underground.', 'This creates igneous rock!'],
      made: 'Igneous rock has been created!',
      from: ['magma'], to: 'ignIn'
    },
    erupt: {
      button: 'Eruption', name: 'Eruption',
      text: ['Sometimes magma erupts onto the Earth’s surface, where it cools and hardens.'],
      made: 'Igneous rock has been created!',
      from: ['magma'], to: 'ignOut'
    }
  },

  order: ['weather', 'transport', 'compact', 'cement', 'heatp', 'melt', 'cool', 'erupt'],

  rocks: {
    surface: { name: 'Rock', color: '#eceff1' },
    sediment: { name: 'Sediment', color: '#ffe082' },
    deposit: { name: 'Sediment', color: '#ffe082' },
    compacted: { name: 'Compacted sediment', color: '#ffe082' },
    sedrock: { name: 'Sedimentary rock', color: '#3ddc84' },   // green
    meta: { name: 'Metamorphic rock', color: '#b16cff' },      // purple
    magma: { name: 'Magma', color: '#ff9a3c' },                // orange (melted rock)
    ignIn: { name: 'Igneous rock', color: '#ff3b3b' },         // red
    ignOut: { name: 'Igneous rock', color: '#ff3b3b' }         // red
  },

  scale: [
    'This block is not drawn to scale. A real block like this would be many miles wide and deep.',
    'The magma chamber is really a few km (a few miles) underground.',
    'Metamorphic rock usually forms 10–30 km (6–19 miles) deep.',
    'Each step takes thousands to millions of years. Here it takes a few seconds!',
    'To keep it simple, one magma chamber feeds both the igneous rock underground and the volcano.',
    'The volcano is drawn steep so it fits. Many real volcanoes are wider and flatter.'
  ]
};
