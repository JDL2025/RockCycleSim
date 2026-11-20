/* =====================================================================
   BACKGROUND MUSIC — quiet music that plays while students explore.
     on      true = music is on when the site first opens (students can
             turn it off with the Music button on the left)
     song    which song plays first (the id of a song below)
     volume  0 to 1 (computers only; iPads ignore this, so the music
             files themselves were made extra quiet)
   Students can turn music on or off and pick a song with the Music button.
     name      the fun name students see;  original  the composer's real title (for credits)
   The music pauses by itself while "Read to me" talks.
   Music by Kevin MacLeod (incompetech.com), Creative Commons: By Attribution 4.0.
   ===================================================================== */
window.MUSIC = {
  on: true,
  song: 'wallpaper',   // Gentle Erosion
  volume: 0.6,
  songs: [
    { id: 'pamgaea', name: 'Volcano Drums', original: 'Pamgaea', mood: 'Upbeat drums', file: 'music/pamgaea.m4a' },
    { id: 'easy-lemon', name: 'Sandy Beach', original: 'Easy Lemon', mood: 'Calm and happy', file: 'music/easy-lemon.m4a' },
    { id: 'investigations', name: 'Rock Detective', original: 'Investigations', mood: 'Curious and sneaky', file: 'music/investigations.m4a' },
    { id: 'wallpaper', name: 'Gentle Erosion', original: 'Wallpaper', mood: 'Light and gentle', file: 'music/wallpaper.m4a' },
    { id: 'carefree', name: 'River Ride', original: 'Carefree', mood: 'Cheerful', file: 'music/carefree.m4a' },
    { id: 'local-forecast', name: 'Million-Year Groove', original: 'Local Forecast', mood: 'Smooth and slow', file: 'music/local-forecast.m4a' }
  ]
};
