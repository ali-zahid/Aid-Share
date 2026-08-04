# Aid-Share — Helping Hand Post Generator

Generate ready-to-share donation appeal images (1080×1080 PNG) with a live preview. Fill in the case details, watch the post update in real time, and download the final image — including a "FUNDED · CASE CLOSED" stamped version once the case is complete.

## Features

- **Live canvas preview** — the preview and the downloaded PNG come from the same renderer, so what you see is exactly what you get.
- **Highlight syntax** — wrap phrases in `**double asterisks**` to render them in teal.
- **Auto-fit text** — the story shrinks gracefully when it gets long, with typing blocked past the hard limit to keep the design intact.
- **Zakat / Urgent ribbons** — toggleable banner tags on the post.
- **Deadline superscript** — date suffixes (st/nd/rd/th) render as superscript automatically.
- **Closed-post version** — darkened post with a diagonal FUNDED stamp.

## Getting started

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Build for deployment

```bash
npm run build
```

The production build is emitted to `build/` and can be served from any static host.

## Project structure

```
src/
  App.js                 App state, preview rendering, download & reset logic
  components/            UI components (form, preview, header, toast)
  lib/
    renderPost.js        Canvas renderer — draws the 1080×1080 post
    textFit.js           Text capacity math (fit checks, char estimates)
    fonts.js             Webfont readiness for canvas text
    images.js            Cached image loader
  assets/                Brand images (logo, background, ribbon tags)
```
