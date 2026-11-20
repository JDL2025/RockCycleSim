/* =====================================================================
   ROCK CYCLE WORDS — everything students read: the menu bar, the
   message at the top of the screen, the rock card and the journey.
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
     time        "How long it takes" on the rock card
     energy      "Energy" on the rock card
     from        which kinds of rock this step can start from. If the
                 grain is something else, it hops to the first one.
     to          what the grain becomes

   rocks       What the grain can be (shown on the rock card).
     name, kind, where, temp (°F first, then °C), color (the grain's color)

   startTag    The label on the first step when the site opens.
   journey     "A Rock's Journey": the words in the step picker.
   scale       The "Is this the real size?" box (Help button).
   ===================================================================== */
window.ROCK_CYCLE = {
  startTag: 'Start here',
  start: 'surface',           // the grain starts as rock on the mountain

  intro: {
    title: 'Choose a step',
    text: 'Every rock is on a very slow journey. Tap a step in the menu bar at the bottom of the screen. Then watch one glowing grain of rock move through Earth’s crust.'
  },

  steps: {
    weather: {
      button: 'Weathering & Erosion', name: 'Weathering & Erosion',
      text: ['Wind and rain break down *rock* into *sediment*.'],
      time: 'Hundreds to millions of years',
      energy: 'The Sun. Its energy makes wind and rain. Gravity pulls the pieces downhill.',
      from: ['surface', 'ignOut'], to: 'sediment'
    },
    transport: {
      button: 'Transport & Deposition', name: 'Transport & Deposition',
      text: ['Wind and water move the sediment.', 'The sediment has reached the ocean.'],
      time: 'Days to thousands of years',
      energy: 'Gravity pulls the water and sediment downhill.',
      from: ['sediment'], to: 'deposit'
    },
    compact: {
      button: 'Compaction', name: 'Compaction',
      text: ['Layers of sediment are laid down over a long time.', 'Gravity squeezes the layers together.'],
      time: 'Thousands to millions of years',
      energy: 'Gravity. The weight of the layers on top presses down.',
      from: ['deposit'], to: 'compacted'
    },
    cement: {
      button: 'Cementation', name: 'Cementation',
      text: ['Water seeps down through the rock, bringing minerals with it.', 'These minerals cement (glue) the sediment together.'],
      made: 'Sedimentary rock has now been made!',
      time: 'Thousands to millions of years',
      energy: 'Gravity pulls the water down through the sediment.',
      from: ['compacted'], to: 'sedrock'
    },
    heatp: {
      button: 'Heat & Pressure', name: 'Heat & Pressure',
      text: ['Sedimentary rock moves deeper, and is heated and squeezed by tremendous pressure.', 'This turns it into metamorphic rock!'],
      made: 'Metamorphic rock has now been made!',
      time: 'Millions of years',
      energy: 'Earth’s hot inside heats the rock. Plate motion pushes it deeper and squeezes it.',
      from: ['sedrock'], to: 'meta'
    },
    melt: {
      button: 'Melting', name: 'Melting',
      text: ['When rock is heated up enough, it melts and turns into magma — liquid rock.'],
      time: 'Thousands to millions of years',
      energy: 'Earth’s hot inside. Rock deep down is very hot.',
      from: ['meta', 'sedrock', 'ignIn'], to: 'magma'
    },
    cool: {
      button: 'Cooling Underground', name: 'Cooling Underground',
      text: ['Sometimes magma cools and hardens while still underground.', 'This creates igneous rock!'],
      made: 'Igneous rock has been created!',
      time: 'Thousands to millions of years',
      energy: 'Heat leaves the magma and goes into the rock around it.',
      from: ['magma'], to: 'ignIn'
    },
    erupt: {
      button: 'Eruption', name: 'Eruption',
      text: ['Sometimes magma erupts onto the Earth’s surface, where it cools and hardens.'],
      made: 'Igneous rock has been created!',
      time: 'Hours to years',
      energy: 'Earth’s hot inside. Hot magma is lighter than the rock around it, so it rises.',
      from: ['magma'], to: 'ignOut'
    }
  },

  order: ['weather', 'transport', 'compact', 'cement', 'heatp', 'melt', 'cool', 'erupt'],

  rocks: {
    surface: { name: 'Rock', kind: 'Solid rock on the side of a mountain', where: 'At the surface, on a mountain', temp: 'Surface temperature', color: '#eceff1' },
    sediment: { name: 'Sediment', kind: 'Loose sand, mud and pebbles', where: 'In the river, carried along by the water', temp: 'Surface temperature', color: '#ffe082' },
    deposit: { name: 'Sediment', kind: 'Layers of sand and mud on the ocean floor', where: 'At the bottom of the ocean', temp: 'Surface temperature', color: '#ffe082' },
    compacted: { name: 'Compacted sediment', kind: 'Sediment squeezed tightly together', where: 'Buried under new layers of sediment', temp: 'About 70–150°F (20–65°C)', color: '#ffd166' },
    sedrock: { name: 'Sedimentary rock', kind: 'Sediment glued together by minerals', where: 'Buried under many layers, below the ocean', temp: 'About 120–300°F (50–150°C)', color: '#ffb74d' },
    meta: { name: 'Metamorphic rock', kind: 'Rock changed by heat and pressure', where: 'Deep underground, usually 10–30 km (6–19 miles) down', temp: 'About 1,000–1,400°F (550–750°C)', color: '#d1c4e9' },
    magma: { name: 'Magma', kind: 'Melted (liquid) rock underground', where: 'In the magma chamber, a few km (a few miles) under the volcano', temp: '1,300–2,400°F (700–1,300°C)', color: '#ff7043' },
    ignIn: { name: 'Igneous rock', kind: 'Magma that cooled slowly underground', where: 'Deep underground', temp: 'Cooling from about 1,300°F (700°C)', color: '#ffc4cc' },
    ignOut: { name: 'Igneous rock', kind: 'Lava that cooled fast on the surface', where: 'On the side of the volcano', temp: 'Cooled from about 2,000°F (1,100°C) to air temperature', color: '#b8b8b8' }
  },

  journey: {
    button: 'A Rock’s Journey',
    stopButton: 'Stop the Journey',
    title: 'A Rock’s Journey',
    directions: [
      'Tap the steps in the order you want your rock to go.',
      'To take a step off, tap it again.',
      'When all 8 steps have a number, tap Play Journey.'
    ],
    play: 'Play Journey',
    startOver: 'Start over',
    pauseSeconds: 3,          // wait time between steps, so students can read
    doneTitle: 'Journey complete!',
    doneSub: 'Your rock went through all 8 steps!'
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
