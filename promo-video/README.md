# Album Fan — promo video (Remotion)

Isolated from the production apps (not an npm workspace). Concept A: "Tu álbum, completo".

## Commands

```console
npm i
npm run dev             # Remotion Studio (preview)
npm run render:vertical # out/promo-social-vertical.mp4  (1080x1920, 30fps, 24s, H.264)
npm run render:play     # out/promo-google-play.mp4      (1920x1080, 30fps, 24s, H.264)
```

## Compositions

- `AlbumFanVertical` — Instagram Reels / TikTok
- `AlbumFanPlay` — Google Play promo video (upload to YouTube, link in Play Console)
- `Scenes/*` — each scene standalone (transparent background)

Both main compositions use the same scenes; each scene re-composes itself for the aspect ratio via `useLayout()`.

## Props

- `musicSrc` — royalty-free track in `public/` (e.g. `audio/music.mp3`). Empty = silent
- `sfx` — subtle UI sounds (taps, whooshes, success). Off by default
- `playBadgeSrc` — official Google Play badge in `public/` (replaces the "Disponible en Google Play" text)

## Assets

- `public/screens/*` — frames from the real screen recording (1080x2400)
- `public/brand/icon.png`, `public/flags/*` — copied from `apps/mobile/assets`
- App screens (grid, repeat modal, stats card, exchange) are recreated in `src/components/app/*`
  mirroring the real React Native styles in `apps/mobile`
