# OG card fonts

Build inputs for `src/utils/generateOgImages.tsx`, not site assets — satori
needs ttf/otf and cannot read the woff2 faces in `public/fonts`, and nothing
should serve these to a browser.

- **IBM Plex Serif** Regular + SemiBold, **IBM Plex Mono** Regular
- Source: <https://www.1001fonts.com/ibm-plex-serif-font.html> /
  <https://www.1001fonts.com/ibm-plex-mono-font.html>
- Upstream: <https://github.com/IBM/plex>
- Licence: SIL Open Font License 1.1, which permits redistribution as part of
  this repository.

Vendored rather than fetched at build: the site rebuilds on a nightly cron, and
a build-time fetch made that an unattended dependency on a third-party host.
Replace these files to change the card's type; keep the families in step with
`src/styles/fonts.css` so cards and site do not drift.
