// Shared by the e2e tests, the framework apps and the static pages, so the
// values the tests expect cannot drift from those the pages use.

// Options changed after init, in steps, each chosen because it has an
// observable effect: the body styles land in the child, scrolling changes the
// parent's iframe element, offsetSize grows the iframe, tolerance suppresses
// a small resize, inPageLinks off restores native anchor behaviour and
// direction switches which dimension of a resize is applied. checkOrigin is
// parent-side only, so changing it must leave messaging working.
// Values are distinctive so they cannot be confused with defaults; bodyMargin
// is numeric to exercise the number -> px conversion.
//
// Every step also sets a distinct bodyBackground, which doubles as a marker
// that the step has reached the child: the frameworks apply a change
// asynchronously and the settings travel in one message, so once the colour
// shows the rest of the step has landed too.
export const updates = (origin) => ({
  styles: {
    bodyBackground: 'rgb(0, 128, 0)',
    bodyPadding: '6px',
    bodyMargin: 12,
    scrolling: true,
    ...(origin === undefined ? {} : { checkOrigin: [origin] }),
  },
  offset: { bodyBackground: 'rgb(0, 0, 128)', offsetSize: 100 },
  tolerance: { bodyBackground: 'rgb(128, 0, 0)', tolerance: 1000 },
  links: { bodyBackground: 'rgb(128, 128, 0)', inPageLinks: false },
  direction: {
    bodyBackground: 'rgb(0, 128, 128)',
    direction: 'horizontal-inline',
  },
})
