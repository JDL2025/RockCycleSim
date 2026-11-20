/* =====================================================================
   ENERGY MODE WORDS — everything students read in Energy mode.
   You can change any words here.
   (On GitHub: open this file, tap the pencil icon, edit, then
   "Commit changes". Keep the quote marks and commas as they are.)

   Put *stars* around words to make them yellow (like *THE SUN!*).

   popup        The first pop-up: the question and the two choices.
   continue     The words on the button that goes to the next part.
   sedimentary  The 4 parts of the Sun's energy story (A, B, C, D).
   igneous      The 4 parts of Earth's heat story (A, B, C, D).
   layers       The temperature tags on the sliced-open Earth
                (°F first, then °C).
   end          The buttons at the end of each story.
   ===================================================================== */
window.ENERGY = {
  modeName: 'Energy',
  hud: 'Energy mode: follow the energy!',

  popup: {
    title: 'Energy',
    text: 'Making different kinds of rocks requires *ENERGY!*',
    question: 'Which kind of rock would you like to make?',
    sedimentary: 'Sedimentary rock',
    igneous: 'Igneous rock'
  },

  continue: 'Continue the Energy Journey',

  sedimentary: [
    'The Sun sends powerful heat and light energy towards the Earth, 24 hours per day.',
    'Ocean water heats up and evaporates, creating wind and humidity.',
    'Water vapor condenses to form clouds. Clouds collect more moisture and turn into storms.',
    'Wind and rain break down rock into sediment, starting the process of creating all sedimentary rocks. Powered by *THE SUN!*'
  ],

  igneous: [
    'Ancient Earth was formed by billions of rocks clumping together due to gravity. As Earth grew larger, its gravity grew stronger, pulling in more material. All of these collisions created tremendous heat energy, melting the Earth into one large ball of liquid rock and metal.',
    'Over a few billion years, the surface of the Earth cooled and formed the crust. Earth’s atmosphere formed, and watery oceans filled in. Life began in the oceans and moved onto land.',
    'Because of how it formed, Earth’s interior remains incredibly hot today.',
    'This heat energy from Earth’s interior causes rocks to melt, starting the process that creates all igneous rocks. All powered by ancient heat energy from the birth of our planet!'
  ],

  layers: [
    { name: 'Crust', temp: 'Up to about 1,800°F (1,000°C)' },
    { name: 'Mantle', temp: 'About 1,800–6,300°F (1,000–3,500°C)' },
    { name: 'Outer core', temp: 'About 8,100–9,900°F (4,500–5,500°C)' },
    { name: 'Inner core', temp: 'About 9,800°F (5,400°C). As hot as the Sun’s surface!' }
  ],

  end: {
    other: { sedimentary: 'Now make igneous rock', igneous: 'Now make sedimentary rock' },
    back: 'Back to the Real World Rock Cycle'
  }
};
