/* =====================================================================
   ROCK CYCLE WORDS — everything students read on the rock card,
   the menu bar and the pop-ups. You can change any words here.
   (On GitHub: open this file, tap the pencil icon, edit, then
   "Commit changes". Keep the quote marks and commas as they are.)

   rocks       Each kind of rock the grain can be.
     name        the big name on the card ("Granite")
     kind        one short line under the name
     where       the "Where" box
     temp        the "Temperature" box (°F first, then °C)
     color       the color of the glowing grain

   processes   The 8 buttons in the menu bar.
     name        the name on the card and in the banner
     button      the words on the menu-bar button
     to          what the grain turns into (shown in the banner)
     time        the "How long it takes" box
     energy      the "Energy" box (where the energy comes from)
     bullets     short sentences on the card, one idea each

   order       The order of the buttons in the menu bar.
   next        Which processes can happen next to each kind of rock.
               (These glow green in the menu bar.)
   startFrom   If a student taps a process that can't happen to the
               rock right now, the grain first jumps to this rock.
   journey     "A Rock's Journey": the pop-up, number of steps and the
               celebration at the end.
   scale       The "Is this the real size?" box (Help button).
   ===================================================================== */
window.ROCK_CYCLE = {
  intro: {
    title: 'Choose a process',
    text: 'Every rock is on a very slow journey. Tap a process in the menu bar at the bottom of the screen. Then watch one glowing grain of rock move through Earth’s crust.'
  },

  rocks: {
    magma: { name: 'Magma', kind: 'Melted rock underground', where: 'In the magma chamber, a few km (a few miles) under the volcano', temp: '1,300–2,400°F (700–1,300°C)', color: '#ff7043' },
    granite: { name: 'Granite', kind: 'Igneous rock with big crystals', where: 'Deep underground, where magma cooled slowly', temp: 'Cooling from about 1,300°F (700°C)', color: '#ffc4cc' },
    basalt: { name: 'Basalt', kind: 'Igneous rock with tiny crystals', where: 'On the volcano, where lava cooled fast', temp: 'Cooled from about 2,000°F (1,100°C) to air temperature', color: '#b8b8b8' },
    sediment: { name: 'Sediment', kind: 'Loose sand, mud and pebbles', where: 'In the river, carried along by the water', temp: 'Surface temperature', color: '#ffe082' },
    deposit: { name: 'Sediment', kind: 'Layers of sand and mud on the sea floor', where: 'At the bottom of the sea', temp: 'Surface temperature', color: '#ffe082' },
    sandstone: { name: 'Sedimentary rock', kind: 'Layers of sandstone and shale', where: 'Buried under new layers, pressed and glued together', temp: 'About 120–300°F (50–150°C)', color: '#ffc27a' },
    gneiss: { name: 'Gneiss', kind: 'Metamorphic rock with stripes', where: 'Deep underground, usually 10–30 km (6–19 miles) down', temp: 'About 1,000–1,400°F (550–750°C)', color: '#d1c4e9' },
    amphibolite: { name: 'Amphibolite', kind: 'Metamorphic rock made from basalt', where: 'Deep underground, usually 10–30 km (6–19 miles) down', temp: 'About 1,000–1,400°F (550–750°C)', color: '#9fc7b4' },
    exposed: { name: '{rock} at the surface', kind: '', where: 'Lifted up when mountains formed. The rock on top wore away.', temp: 'Surface temperature', color: '#ffffff' }
  },

  processes: {
    weather: {
      name: 'Weathering & erosion', button: 'Weathering & erosion', to: 'Sediment',
      time: 'Hundreds to millions of years',
      energy: 'The Sun. Its energy makes wind, rain and ice. Gravity pulls the pieces downhill.',
      bullets: [
        'Rain, ice, wind and plant roots break rock into small pieces. This is weathering.',
        'Water, wind and ice carry the pieces away. This is erosion.',
        'The small pieces are called sediment.'
      ]
    },
    transport: {
      name: 'Transport & deposition', button: 'Transport & deposition', to: 'Sediment on the sea floor',
      time: 'Days to thousands of years',
      energy: 'Gravity pulls the water and sediment downhill. The Sun keeps the water cycle going.',
      bullets: [
        'A river carries the sediment downhill to the sea.',
        'When the water slows down, the pieces sink. They settle in layers. This is deposition.',
        'Big pebbles drop first. Tiny bits of mud drop last.'
      ]
    },
    compact: {
      name: 'Compaction & cementation', button: 'Compaction & cementation', to: 'Sedimentary rock',
      time: 'Thousands to millions of years',
      energy: 'Gravity. The weight of the layers on top presses down.',
      bullets: [
        'New layers of sediment pile up on top.',
        'Their weight squeezes the pieces together. This is compaction.',
        'Minerals in the water glue the pieces together. This is cementation.',
        'Now the sediment is sedimentary rock.'
      ]
    },
    heatp: {
      name: 'Heat & pressure', button: 'Heat & pressure', to: 'Metamorphic rock',
      time: 'Millions of years',
      energy: 'Earth’s hot inside heats the rock. Plate motion pushes and squeezes it.',
      bullets: [
        'Plate motion can push rock deep underground, where mountains form.',
        'Down there, the rock is very hot and squeezed very hard.',
        'The rock changes, but it does not melt. Its minerals line up in stripes.',
        'Now it is metamorphic rock.'
      ]
    },
    melt: {
      name: 'Melting', button: 'Melting', to: 'Magma',
      time: 'Thousands to millions of years',
      energy: 'Earth’s hot inside. Rock deep down is very hot.',
      bullets: [
        'Deeper down, it gets even hotter.',
        'At about 1,200 to 2,200°F (650 to 1,200°C), rock melts.',
        'Melted rock underground is called magma.',
        'Magma is lighter than the rock around it, so it slowly rises.'
      ]
    },
    intrude: {
      name: 'Cooling underground', button: 'Cooling underground', to: 'Granite',
      time: 'Thousands to millions of years',
      energy: 'Heat leaves the magma and goes into the rock around it.',
      bullets: [
        'Some magma stays underground.',
        'It cools very slowly, so its crystals have lots of time to grow big.',
        'It becomes igneous rock with big crystals, like granite.'
      ]
    },
    erupt: {
      name: 'Eruption (lava cools)', button: 'Eruption (lava cools)', to: 'Basalt',
      time: 'Hours to years',
      energy: 'Earth’s hot inside. Hot magma is lighter than the rock around it, so it rises.',
      bullets: [
        'Magma rises up through the volcano and erupts.',
        'Magma that comes out on the surface is called lava.',
        'Lava cools fast in the air or water, so its crystals are tiny.',
        'It becomes igneous rock with tiny crystals, like basalt.'
      ]
    },
    uplift: {
      name: 'Uplift', button: 'Uplift', to: 'Rock at the surface',
      time: 'Millions of years (a few mm, or less than ¼ inch, a year)',
      energy: 'Earth’s hot inside makes the plates move. Plate motion pushes rock up.',
      bullets: [
        'Plate motion pushes rock up to build mountains.',
        'Weathering and erosion wear away the rock on top.',
        'Rock that formed deep down ends up at the surface.',
        'Now it can be weathered again!'
      ]
    }
  },

  order: ['weather', 'transport', 'compact', 'heatp', 'melt', 'intrude', 'erupt', 'uplift'],

  next: {
    magma: ['intrude', 'erupt'],
    granite: ['uplift', 'heatp', 'melt'],
    basalt: ['weather', 'heatp', 'melt'],
    sediment: ['transport'],
    deposit: ['compact'],
    sandstone: ['uplift', 'heatp', 'melt'],
    gneiss: ['melt', 'uplift'],
    exposed: ['weather']
  },

  startFrom: {
    weather: 'exposed', transport: 'sediment', compact: 'deposit', heatp: 'sandstone',
    melt: 'gneiss', intrude: 'magma', erupt: 'magma', uplift: 'granite'
  },

  jumpText: 'To show {process}, the grain starts as {rock}.',

  journey: {
    button: 'A Rock’s Journey',
    stopButton: 'Stop the journey',
    title: 'A Rock’s Journey',
    text: 'Follow one grain of rock on a surprise trip around the rock cycle. Every trip is different!',
    go: 'Start the journey',
    steps: 8,
    doneTitle: 'Journey complete!',
    doneSub: 'Your rock took 8 steps around the rock cycle!'
  },

  scale: [
    'This block is not drawn to scale. A real block like this would be many miles wide and deep.',
    'The magma chamber is really a few km (a few miles) underground.',
    'Metamorphic rock usually forms 10–30 km (6–19 miles) deep.',
    'Each step takes thousands to millions of years. Here it takes a few seconds!',
    'To keep it simple, one magma chamber feeds both the granite and the volcano.',
    'The volcano is drawn steep so it fits. Volcanoes made of basalt are often wide and gentle.'
  ]
};
