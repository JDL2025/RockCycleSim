/* =====================================================================
   ROCK TYPES WORDS — everything students read in Rock Types mode.
   You can change any words here.
   (On GitHub: open this file, tap the pencil icon, edit, then
   "Commit changes". Keep the quote marks and commas as they are.)

   rocks     The 12 rocks. For each rock:
               kind     'igneous', 'sedimentary' or 'metamorphic'
               forms    how it forms
               startsAs (metamorphic rocks only) the rock it started as
               found    where it is found
               used     what people use it for
               wow      a cool fact
               photo    the photo file in assets/rocks/, and its credit
             Where each crystal sits on the 3D model is set in js/rocks.js.
   kinds     The 3 category boxes: name and color.
   quiz      The Rock Types Quiz: tap 2 rocks of each kind (6 questions).
             "pass" = how many right on the first try to pass.
   ===================================================================== */
window.ROCK_TYPES = {
  button: 'Rock Types',
  hud: 'Tap a glowing crystal to discover a rock!',
  hudDrag: 'Drag the rock into the right box below!',
  hudBusy: 'Sort this rock first! Drag it into a box below.',
  hudDone: 'All 12 rocks sorted! Tap any rock to read about it.',
  counter: '{n}/12 sorted',
  dragMe: 'Drag me!',
  takeQuiz: 'Take the Rock Types Quiz',
  startOver: 'Start over',
  allSorted: 'All 12 rocks sorted!',
  allSortedSub: 'Now take the Rock Types Quiz.',

  // the pop-up
  labels: { kind: 'Kind of rock', forms: 'How it forms', startsAs: 'Starts as', found: 'Where it’s found', used: 'Used for', wow: 'Wow!' },
  popupButton: 'Got it! Now sort it',
  popupButtonReview: 'Close',
  photoBy: 'Photo',

  // wrong box: the hint pop-up
  hintTitles: ['Not quite!', 'So close!', 'Good try!', 'Almost!', 'Hmm, not yet!'],
  hint: 'Remember: {forms} Which kind of rock forms that way?',
  hintButton: 'Try again',
  right: 'Correct!',

  kinds: {
    igneous:     { name: 'Igneous',     color: '#ff3b3b', about: 'Made when magma or lava cools and hardens' },
    sedimentary: { name: 'Sedimentary', color: '#3ddc84', about: 'Made when sediment is pressed and cemented together' },
    metamorphic: { name: 'Metamorphic', color: '#b16cff', about: 'Made when rock is changed by heat and pressure' }
  },

  rocks: {
    granite: {
      name: 'Granite', kind: 'igneous',
      forms: 'Magma cooled slowly, deep underground. That gave it big crystals you can see.',
      found: 'Deep underground. It shows up in mountains when the rock above it wears away.',
      used: 'Kitchen countertops, buildings, and monuments.',
      wow: 'Mount Rushmore is carved into granite!',
      photo: { file: 'granite.jpg', by: 'James St. John', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Granite_34_(49200986291).jpg' }
    },
    basalt: {
      name: 'Basalt', kind: 'igneous',
      forms: 'Lava cooled quickly on Earth’s surface. Gas bubbles can leave little holes in it.',
      found: 'Lava flows, Hawaii, and most of the ocean floor.',
      used: 'Crushed rock for roads, and building stone.',
      wow: 'Much of the surface of Mars is covered in basalt!',
      photo: { file: 'basalt.jpg', by: 'James St. John', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Vesicular_basalt_(Quaternary;_Snake_River_Plain,_Idaho,_USA)_4.jpg' }
    },
    obsidian: {
      name: 'Obsidian', kind: 'igneous',
      forms: 'Lava cooled so fast that crystals had no time to grow. It turned into natural glass!',
      found: 'Near volcanoes, like Obsidian Cliff in Yellowstone.',
      used: 'Long ago, people made sharp arrowheads and knives from it.',
      wow: 'Its broken edges can be sharper than a razor!',
      photo: { file: 'obsidian.jpg', by: 'James St. John', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Spherulitic_obsidian_(Medicine_Lake_Highlands,_California,_USA)_1.jpg' }
    },
    pumice: {
      name: 'Pumice', kind: 'igneous',
      forms: 'Foamy lava full of gas bubbles blasted out of a volcano and cooled fast.',
      found: 'Near volcanoes that explode, like Mount St. Helens. This one came from there!',
      used: 'Pumice stones for scrubbing rough skin on feet.',
      wow: 'Pumice is so full of air bubbles that it can float on water!',
      photo: { file: 'pumice.jpg', by: 'James St. John', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Pumice_(Mt._St._Helens,_Washington_State,_USA)_2.jpg' }
    },
    sandstone: {
      name: 'Sandstone', kind: 'sedimentary',
      forms: 'Layers of sand were pressed together and cemented (glued) into rock.',
      found: 'Deserts, beaches, and canyons, like the Grand Canyon.',
      used: 'Buildings and walls.',
      wow: 'The giant red arches in Arches National Park are made of sandstone!',
      photo: { file: 'sandstone.jpg', by: 'Darla Sondrol (GeoDIL)', license: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:Sandstone_(GeoDIL_number_-_11).jpg' }
    },
    limestone: {
      name: 'Limestone', kind: 'sedimentary',
      forms: 'Shells and skeletons of sea creatures piled up on the sea floor and were cemented together.',
      found: 'Places that were once under the sea, like Illinois and Indiana!',
      used: 'Making cement and concrete, and building stone.',
      wow: 'Limestone often has fossils of ancient sea creatures in it. Look closely at this one!',
      photo: { file: 'limestone.jpg', by: 'James St. John', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Fossiliferous_limestone_(Upper_Ordovician;_Cincinnati_area,_USA).jpg' }
    },
    coal: {
      name: 'Coal', kind: 'sedimentary',
      forms: 'Plants from ancient swamps were buried and squeezed for millions of years.',
      found: 'In layers underground. Illinois has lots of coal!',
      used: 'Burning to make electricity.',
      wow: 'Much of the coal in Illinois is made from plants that grew before the dinosaurs!',
      photo: { file: 'coal.jpg', by: 'James St. John', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Bituminous_coal_(Ferron_Sandstone_Member,_Mancos_Shale,_Upper_Cretaceous;_Bronco_Mine,_Emery_County,_Utah,_USA)_8.jpg' }
    },
    rocksalt: {
      name: 'Rock salt', kind: 'sedimentary',
      forms: 'Salty seawater dried up and left the salt behind in thick layers.',
      found: 'Deep underground. There is a huge salt mine under the city of Detroit!',
      used: 'Salting icy roads in winter, and table salt.',
      wow: 'It’s one of the only rocks that people eat!',
      photo: { file: 'rocksalt.jpg', by: 'James St. John', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Pink_halite_(Holocene;_Searles_Lake,_near_Trona,_California,_USA)_1.jpg' }
    },
    marble: {
      name: 'Marble', kind: 'metamorphic', startsAs: 'Limestone',
      forms: 'Limestone was heated and squeezed deep underground.',
      found: 'Vermont, Georgia, Colorado, and Italy.',
      used: 'Statues and fancy buildings.',
      wow: 'The Lincoln Memorial is made of marble from the same place as this rock!',
      photo: { file: 'marble.jpg', by: 'James St. John', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Marble_(Yule_Marble,_Middle_Miocene,_12_Ma;_Marble,_northern_Gunnison_County,_western_Colorado,_USA)_2_(16887651452).jpg' }
    },
    slate: {
      name: 'Slate', kind: 'metamorphic', startsAs: 'Shale (a rock made of mud)',
      forms: 'Shale, a rock made of mud, was squeezed and heated.',
      found: 'Pennsylvania, Vermont, and Wales.',
      used: 'Roof tiles, old chalkboards, and pool tables.',
      wow: 'Slate splits into thin, flat sheets!',
      photo: { file: 'slate.jpg', by: 'James St. John', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Gray_slate_(Martinsburg_Formation,_Ordovician;_near_Bangor,_Slate_Belt,_Pennsylvania,_USA)_1.jpg' }
    },
    gneiss: {
      name: 'Gneiss', kind: 'metamorphic', startsAs: 'Granite or other rocks',
      forms: 'Rock was heated and squeezed so much that its minerals lined up in stripes.',
      found: 'Deep in Earth’s crust, like in Canada.',
      used: 'Countertops and building stone.',
      wow: 'It’s pronounced “nice”! Some gneiss is about 4 billion years old.',
      photo: { file: 'gneiss.jpg', by: 'James St. John', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:L-tectonite_gneiss_(Precambrian;_Uxbridge,_Massachusetts,_USA)_3_-_53324151920.jpg' }
    },
    quartzite: {
      name: 'Quartzite', kind: 'metamorphic', startsAs: 'Sandstone',
      forms: 'Sandstone was heated and squeezed until the sand grains fused together.',
      found: 'Wisconsin, Minnesota, and South Dakota.',
      used: 'Countertops, and crushed rock for railroad tracks.',
      wow: 'It’s harder than glass. It can scratch a window!',
      photo: { file: 'quartzite.jpg', by: 'James St. John', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Quartzite_(Sioux_Quartzite,_Paleoproterozoic,_1.65_to_1.70_Ga;_city_of_Sioux_Falls,_Transcontinental_Arch,_South_Dakota,_USA)_3.jpg' }
    }
  },

  quiz: {
    title: 'Rock Types Quiz',
    pass: 4,                                   // out of 6, right on the first try
    ask: 'Tap {a} {kind} rock.',
    askAnother: 'Tap another {kind} rock.',
    step: 'Question {n} of 6',
    right: 'Correct! {name} is {kind}.',
    wrong: 'Not quite. {name} is {kind}. Try again!',
    next: 'Next',
    finish: 'See my score',
    scoreTitle: 'Your score',
    perfectTitle: 'Perfect score!',
    perfectSub: 'You know your rock types!',
    goodJob: 'Good work! Try again to get a perfect score.',
    outOf: 'out of',
    firstTry: 'right on the first try',
    again: 'Take the quiz again',
    done: 'Done'
  }
};
