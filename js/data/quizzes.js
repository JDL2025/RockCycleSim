/* =====================================================================
   QUIZZES — the questions, answers and explanations.
   You can change any words here.
   (On GitHub: open this file, tap the pencil icon, edit, then
   "Commit changes". Keep the quote marks and commas as they are.)

   Each quiz has a title, a theme color ('purple', 'orange' or 'pink'),
   and "pass": how many questions students must get right on the first
   try to pass. Passing unlocks the next mode (see My Progress).

   Each question has:
     q         the question
     answers   4 choices. Each choice has:
                 text  the words on the button
                 why   (wrong choices) why this answer is wrong
     correct   which choice is right: 0 = first, 1 = second, 2 = third, 3 = fourth
     explain   why the right answer is right

   How it works for students:
     1st wrong try: they see why it's wrong and try again.
     2nd wrong try: they see why it's wrong, then the right answer and why.
     Score = questions they got right on the first try.
     A perfect score plays fireworks.

   realWorld    8 questions (the Quiz button at the end of the menu bar)
   sedimentary  3 questions (end of the Sun's energy story)
   igneous      3 questions (end of Earth's heat story)
   ===================================================================== */
window.QUIZZES = {
  words: {
    right: 'Correct!',
    wrong: 'Not quite.',
    tryAgain: 'Try again! Pick a different answer.',
    reveal: 'The correct answer is:',
    next: 'Next question',
    finish: 'See my score',
    scoreTitle: 'Your score',
    firstTry: 'right on the first try',
    perfectTitle: 'Perfect score!',
    perfectSub: 'You got every question right on the first try!',
    goodJob: 'Good work! Try again to get a perfect score.',
    again: 'Take the quiz again',
    done: 'Done',
    button: 'Quiz',
    takeQuiz: 'Take the Quiz'
  },

  realWorld: {
    title: 'Rock Cycle Quiz',
    pass: 6,
    theme: 'purple',
    questions: [
      {
        q: 'What do wind and rain do during weathering and erosion?',
        answers: [
          { text: 'They break rock into small pieces called sediment.' },
          { text: 'They melt rock into magma.', why: 'Wind and rain are not hot enough to melt rock. Melting happens deep underground.' },
          { text: 'They glue sediment together.', why: 'Gluing sediment together is cementation. It happens later, after the sediment is buried.' },
          { text: 'They push rock deep underground.', why: 'Wind and rain work at the surface. They do not push rock down deep.' }
        ],
        correct: 0,
        explain: 'Wind and rain slowly break rock into small pieces. These pieces are called sediment.'
      },
      {
        q: 'Where does the river carry the sediment?',
        answers: [
          { text: 'Up to the top of the mountain', why: 'Rivers flow downhill, not uphill.' },
          { text: 'Into the magma chamber', why: 'The magma chamber is deep underground. Rivers flow on the surface.' },
          { text: 'Downhill to the ocean' },
          { text: 'Into the volcano', why: 'Rivers do not carry sediment into volcanoes. They flow downhill to the ocean.' }
        ],
        correct: 2,
        explain: 'Water flows downhill. The river carries the sediment down to the ocean, where it settles in layers.'
      },
      {
        q: 'What happens during compaction?',
        answers: [
          { text: 'Rock melts into magma.', why: 'Melting needs a lot of heat deep underground. Compaction is about squeezing, not melting.' },
          { text: 'Layers of sediment pile up, and gravity squeezes them together.' },
          { text: 'Lava cools on the surface.', why: 'Lava cooling is part of an eruption. It makes igneous rock, not compacted sediment.' },
          { text: 'Wind blows the sediment away.', why: 'Wind moving sediment is erosion. Compaction happens after the sediment is buried.' }
        ],
        correct: 1,
        explain: 'New layers of sediment pile on top. Gravity pulls them down, and their weight squeezes the sediment together.'
      },
      {
        q: 'What happens during cementation?',
        answers: [
          { text: 'Wind and rain break rock apart.', why: 'Breaking rock apart is weathering. Cementation puts sediment together.' },
          { text: 'Rock is heated and squeezed deep underground.', why: 'Heat and pressure make metamorphic rock. Cementation happens closer to the surface.' },
          { text: 'Magma erupts from a volcano.', why: 'An eruption makes igneous rock. Cementation is about water and minerals.' },
          { text: 'Water brings minerals that glue the sediment together.' }
        ],
        correct: 3,
        explain: 'Water seeps down through the sediment and brings minerals with it. The minerals cement (glue) the pieces together.'
      },
      {
        q: 'What kind of rock is made after cementation?',
        answers: [
          { text: 'Sedimentary rock' },
          { text: 'Igneous rock', why: 'Igneous rock is made when magma or lava cools. Cementation glues sediment, so it makes sedimentary rock.' },
          { text: 'Metamorphic rock', why: 'Metamorphic rock is made by heat and pressure deep underground.' },
          { text: 'Magma', why: 'Magma is melted rock. Cementation does not melt anything.' }
        ],
        correct: 0,
        explain: 'When sediment is glued together, it becomes sedimentary rock. In the sim, the grain turns green!'
      },
      {
        q: 'Heat and pressure deep underground change sedimentary rock into…',
        answers: [
          { text: 'sediment', why: 'Sediment is made when rock breaks apart at the surface, not deep underground.' },
          { text: 'lava', why: 'Lava is melted rock on the surface. Heat and pressure change rock without melting it.' },
          { text: 'metamorphic rock' },
          { text: 'igneous rock', why: 'Igneous rock is made when magma or lava cools. Heat and pressure make metamorphic rock.' }
        ],
        correct: 2,
        explain: 'Deep underground, rock is heated and squeezed very hard. It changes into metamorphic rock. In the sim, the grain turns purple!'
      },
      {
        q: 'What is magma?',
        answers: [
          { text: 'Sediment carried by a river', why: 'Sediment is small pieces of rock. Magma is melted rock.' },
          { text: 'Liquid (melted) rock underground' },
          { text: 'Rock glued together by minerals', why: 'Rock glued by minerals is sedimentary rock.' },
          { text: 'Water vapor in a cloud', why: 'Water vapor is water, not rock.' }
        ],
        correct: 1,
        explain: 'When rock gets hot enough, it melts. Melted rock underground is called magma.'
      },
      {
        q: 'Which two steps make igneous rock?',
        answers: [
          { text: 'Compaction and cementation', why: 'Compaction and cementation make sedimentary rock.' },
          { text: 'Weathering and erosion', why: 'Weathering and erosion break rock into sediment.' },
          { text: 'Heat and pressure', why: 'Heat and pressure change rock without melting it. That makes metamorphic rock.' },
          { text: 'Melting, then cooling and hardening' }
        ],
        correct: 3,
        explain: 'First, rock melts into magma. Then the magma cools and hardens into igneous rock. It can cool underground, or erupt and cool on the surface. In the sim, the grain turns red!'
      }
    ]
  },

  sedimentary: {
    title: 'Sun Energy Quiz',
    theme: 'orange',
    pass: 3,
    questions: [
      {
        q: 'Where does the energy that starts making sedimentary rock come from?',
        answers: [
          { text: 'Earth’s hot interior', why: 'Earth’s inside heat melts rock and makes igneous rock. Sedimentary rock starts with the Sun.' },
          { text: 'The Sun' },
          { text: 'The Moon', why: 'The Moon does not send heat energy to make rain and storms. The Sun does.' },
          { text: 'Volcanoes', why: 'Volcanoes make igneous rock. Sedimentary rock starts with energy from the Sun.' }
        ],
        correct: 1,
        explain: 'The Sun heats Earth. That energy makes wind and rain, which break rock into sediment.'
      },
      {
        q: 'What happens when the Sun heats ocean water?',
        answers: [
          { text: 'The water evaporates into water vapor.' },
          { text: 'The water freezes into ice.', why: 'Heat makes water warmer, not colder. Ice forms when water gets cold.' },
          { text: 'The water turns into magma.', why: 'Magma is melted rock, not water.' },
          { text: 'The water sinks to the ocean floor.', why: 'Heated water rises into the air as vapor. It does not sink.' }
        ],
        correct: 0,
        explain: 'Heat from the Sun makes ocean water evaporate. The water vapor rises into the air.'
      },
      {
        q: 'What happens when water vapor rises and cools?',
        answers: [
          { text: 'It turns into rock.', why: 'Water vapor is water, not rock. When it cools, it makes clouds.' },
          { text: 'It condenses to form clouds.' },
          { text: 'It sinks back into the ocean.', why: 'Water vapor rises into the sky. There it cools and forms clouds.' },
          { text: 'It melts into magma.', why: 'Magma is melted rock, not water.' }
        ],
        correct: 1,
        explain: 'Water vapor condenses to form clouds. Clouds collect more moisture and turn into storms.'
      },
      {
        q: 'How do storms help make sedimentary rock?',
        answers: [
          { text: 'Storms melt rock into magma.', why: 'Storms are not hot enough to melt rock.' },
          { text: 'Storms make volcanoes erupt.', why: 'Volcanoes erupt because of heat inside Earth, not because of storms.' },
          { text: 'Storms push rock deep underground.', why: 'Storms happen at the surface. They do not push rock deep down.' },
          { text: 'Wind and rain break rock into sediment.' }
        ],
        correct: 3,
        explain: 'Storms bring wind and rain. They break rock into sediment, which is the first step in making sedimentary rock.'
      }
    ]
  },

  igneous: {
    title: 'Earth’s Heat Quiz',
    theme: 'pink',
    pass: 3,
    questions: [
      {
        q: 'How did ancient Earth get so hot?',
        answers: [
          { text: 'The Sun shined on it.', why: 'The Sun warms Earth’s surface, but it did not melt the whole planet.' },
          { text: 'Ocean water heated it up.', why: 'There were no oceans yet. Oceans filled in later, after Earth cooled.' },
          { text: 'Billions of rocks crashed together, and the collisions made heat.' },
          { text: 'Storms rubbed the rocks together.', why: 'There were no storms yet. The heat came from rocks crashing together in space.' }
        ],
        correct: 2,
        explain: 'Gravity pulled billions of rocks together. All of those crashes made so much heat that Earth melted.'
      },
      {
        q: 'What formed when the surface of the young, hot Earth cooled?',
        answers: [
          { text: 'The inner core', why: 'The inner core is deep in the center, and it is still very hot. The surface cooled first.' },
          { text: 'The Sun', why: 'The Sun is a star. It did not form from Earth cooling.' },
          { text: 'The crust' },
          { text: 'Magma', why: 'Magma is melted rock. When the surface cooled, it hardened into the crust.' }
        ],
        correct: 2,
        explain: 'Over a few billion years, the surface of the Earth cooled and formed the crust.'
      },
      {
        q: 'Is Earth’s interior still hot today?',
        answers: [
          { text: 'Yes. The inner core is about 9,800°F (5,400°C).' },
          { text: 'No. It cooled off completely.', why: 'Only the surface cooled. Earth’s inside is still very hot.' },
          { text: 'Only the crust is hot.', why: 'The crust is the coolest layer. The layers get hotter as you go deeper.' },
          { text: 'Only during the daytime.', why: 'Earth’s inside heat comes from how Earth formed, not from the Sun. It is hot day and night.' }
        ],
        correct: 0,
        explain: 'Because of how it formed, Earth is still very hot inside. The inner core is about as hot as the surface of the Sun!'
      },
      {
        q: 'What does heat from Earth’s interior do in the rock cycle?',
        answers: [
          { text: 'It makes ocean water evaporate.', why: 'The Sun makes ocean water evaporate.' },
          { text: 'It melts rock into magma, starting igneous rock.' },
          { text: 'It makes wind and rain.', why: 'Wind and rain come from the Sun’s energy.' },
          { text: 'It glues sediment together.', why: 'Minerals in water glue sediment together. That is cementation.' }
        ],
        correct: 1,
        explain: 'Heat from inside Earth melts rock into magma. When magma cools, it becomes igneous rock.'
      }
    ]
  }
};
