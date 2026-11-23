/* =====================================================================
   MY PROGRESS WORDS — unlocking modes, the pass scores pop-up,
   the My Progress panel, the teacher "Unlock all" panel, and the
   "Add to Home Screen" steps. You can change any words here.
   (On GitHub: open this file, tap the pencil icon, edit, then
   "Commit changes". Keep the quote marks and commas as they are.)

   The pass score for each quiz is set with the quiz itself:
     Rock Cycle Quiz, Sun Energy Quiz, Earth's Heat Quiz → js/data/quizzes.js ("pass")
     Diagram Quiz → js/data/diagram.js ("pass")

   How unlocking works:
     Real World Rock Cycle  always open. Its Quiz opens after all 8 steps have been played.
     Energy                 opens after passing the Rock Cycle Quiz.
     Rock Cycle Diagram     opens after passing BOTH Energy quizzes.
   Students can always go back to a mode they have unlocked.
   Progress is saved on each iPad.

   {words} in curly brackets are filled in by the site. Keep them as they are.
   ===================================================================== */
window.PROGRESS = {
  button: 'My Progress',
  title: 'My Progress',
  overall: '{n} of {total} milestones complete',

  modes: { real: 'Real World Rock Cycle', energy: 'Energy', diagram: 'Rock Cycle Diagram' },

  // the rows in My Progress
  rows: {
    steps: 'Play all 8 steps',
    stepsCount: '{n} of 8 steps played',
    sedStory: 'Sun Energy story',
    ignStory: 'Earth’s Heat story',
    diagramLesson: 'Diagram lesson',
    storyDone: 'Done!',
    storyNot: 'Not done yet'
  },
  quizLine: {
    notTaken: 'Not taken yet. Pass: {need} out of {n}',
    best: 'Best: {best} out of {n} ({pct}%)',
    last: 'Last try: {last} out of {n}',
    tries: 'Tries: {tries}',
    passed: 'Passed',
    need: 'Pass: {need} out of {n}'
  },

  // locked modes and the locked Quiz button
  lockedTitle: 'Locked',
  lockedMode: {
    energy: 'Pass the Rock Cycle Quiz to unlock Energy.',
    diagram: 'Pass the Sun Energy Quiz and the Earth’s Heat Quiz to unlock the Rock Cycle Diagram.'
  },
  lockedQuiz: 'Play all 8 steps in the menu bar first! You have played {n} of 8.',
  lockedOk: 'OK',
  lockedProgress: 'See My Progress',

  // the pop-up at the start of each milestone quiz
  passIntro: {
    title: 'Get ready!',
    text: 'To pass this quiz, get {need} out of {n} right on the first try.',
    unlocks: 'Passing unlocks {next}!',
    last: 'This is the last quiz!',
    start: 'Start the quiz'
  },
  // on the score screen
  passed: 'You passed!',
  alreadyPassed: 'Your best score already passed. Nice!',
  notPassed: 'You need {need} out of {n} to pass. Try again!',
  unlockedNow: '{mode} is now unlocked!',
  allDone: 'You finished all of Rock Cycle Explorer!',
  seeProgress: 'My Progress',

  // teacher panel
  teacher: {
    button: 'Unlock all',
    title: 'Teacher: Unlock all',
    text: 'Type the teacher password to unlock every mode and quiz on this iPad.',
    placeholder: 'Password',
    unlock: 'Unlock all',
    wrong: 'That password isn’t right.',
    done: 'Everything is unlocked on this iPad.',
    lockAgain: 'Lock again',
    lockedAgain: 'Locked again. Students’ normal unlocking is back on.',
    erase: 'Erase this iPad’s progress',
    eraseSure: 'Tap again to erase everything',
    erased: 'All progress on this iPad was erased.'
  },

  // Add to Home Screen
  home: {
    button: 'Add to Home Screen',
    title: 'Add to your Home Screen',
    intro: 'Do this first! Your progress is saved in the Home Screen app.',
    steps: [
      'Tap the *Share* button at the top of Safari. It looks like a square with an arrow pointing up. (If you don’t see it, tap the ••• button first.)',
      'Tap *Add to Home Screen*. If you don’t see it, scroll down the list.',
      'Tap *Add*.',
      'Go to your Home Screen and find the *Rock Cycle* icon.',
      'From now on, always open Rock Cycle Explorer from that icon.'
    ],
    already: 'You are using the Home Screen app. Your progress is saved here.',
    install: 'Install',
    ok: 'Got it'
  }
};
