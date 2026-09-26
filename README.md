# Album Fan — World Cup 2026

Tracker digital del álbum de figuritas FIFA World Cup 2026. Web app + mobile app (Expo).

**Web:** https://albumfan.com (Vercel)
**Mobile:** Android via EAS Build

---

## Stack

| | Web | Mobile |
|---|---|---|
| Framework | React 18 + Vite 5 + Tailwind v4 | Expo SDK 56 + RN 0.85 |
| Routing | SPA (App.tsx compone todo) | expo-router (file-based) |
| Styling | Tailwind v4 + CSS vars | Inline StyleSheet + ThemeContext |
| Auth/DB | Supabase (Google OAuth + RLS) | Supabase (Google OAuth + RLS) |
| Monorepo | npm workspaces | npm workspaces |

**Shared package** (`packages/shared`): datos, i18n, hooks factory, decodificadores QR. Sin build step — ambas apps consumen el TS directo.

---

## Setup

```bash
nvm use            # Node v22.7.0
npm install
```

### Variables de entorno

**Web** — crear `apps/web/.env`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Mobile** — crear `apps/mobile/.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # solo para bump-version
```

> ⚠️ Sin `EXPO_PUBLIC_*` la app crashea al arrancar. Los builds EAS no leen `.env` — las vars deben ser EAS secrets.

---

## Comandos

```bash
npm run dev:web            # Vite dev server
npm run dev:mobile         # Expo dev server
npm run build:mobile:android:development # Development build para Android (requerido para OAuth)

npm run test               # Vitest (shared + mobile, 33 tests)
npm run test:shared        # Solo tests del shared package
npm run test:mobile        # Solo tests del mobile package

npm run lint               # ESLint (web + mobile)
npm run typecheck          # tsc (web+shared) && tsc mobile
npm run format             # Prettier

npm run build:web          # Build producción web
npm run build:mobile:android   # EAS Build Android
```

### Desarrollo móvil con Google OAuth

En Expo Go, el login usa `https://albumfan.com/mobile-callback.html` como intermediario.
Después de completar Google OAuth, pulsa **Volver a Album Fan** para regresar a la app y
guardar la sesión. Este mecanismo solo se activa cuando Expo genera una URL `exp://` o
`exps://`.

En Supabase deben estar permitidas estas Redirect URLs:

```text
https://albumfan.com/mobile-callback.html?*
mi-album-fifa://auth/callback
```

La página `apps/web/public/mobile-callback.html` debe estar desplegada antes de probar el
flujo. Luego puedes iniciar Expo Go normalmente:

```bash
npm run dev:mobile -- --clear
```

Expo no garantiza OAuth dentro de Expo Go. Si el navegador o una futura versión vuelve a
bloquear este mecanismo, genera e instala una vez el development build:

```bash
npm run build:mobile:android:development
```

En Supabase, agrega `mi-album-fifa://auth/callback` a **Authentication → URL
Configuration → Redirect URLs**. Instala el APK generado por EAS en el teléfono y luego
levanta Metro con:

```bash
npm run dev:mobile -- --dev-client --clear
```

Abre **Album Fan** (el development build), no Expo Go. Producción y los development builds
usan directamente `mi-album-fifa://auth/callback`; no pasan por la página intermediaria.

---

## Tests

Framework: **Vitest**. Archivos de test:
- `packages/shared/src/lib/externalQR.test.ts` — 13 tests (decoding QR externo Panini)
- `apps/mobile/src/lib/qrCodec.test.ts` — 20 tests (encoding/decoding interno, matching, trade QRs)

```bash
npm test                   # corre ambos suites
```

CI: `.github/workflows/ci.yml` corre tests + typecheck + lint + build web en cada push/PR a main.

---

## Release Android

### Proceso completo

#### Fase 1 — Preparar la versión

Con el working tree limpio, ejecutar:

```bash
npm run release:prepare
```

Este comando valida el export Android, incrementa la versión, sube `version.json` a Supabase con `published: false` y hace commit y push de `app.json`.

#### Fase 2 — Lanzar el build

```bash
npm run release:build
```

El comando comprime y sube el proyecto a EAS con `--no-wait`. Cuando vuelve el prompt de la terminal, el build queda ejecutándose en la nube y ya se puede cerrar la terminal o apagar el equipo.

También se pueden ejecutar las dos primeras fases juntas:

```bash
npm run release
```

El resultado es:
- Un build de producción en EAS que continúa aunque el equipo local se apague
- `app.json` con la nueva versión commiteada y pusheada a `master`
- `version.json` en Supabase con `published: false`
- Un archivo `.aab` disponible al finalizar en [Expo Dashboard](https://expo.dev/accounts/studio84dev/projects/mi-album-fifa/builds)

#### Fase 3 — Subir a Play Store

1. Ir a [Google Play Console](https://play.google.com/console) → **Producción** → **Crear release nuevo**
2. Subir el `.aab` generado por EAS
3. Completar notas de release (si aplica)
4. Enviar para revisión

#### Fase 4 — Publicar actualización in-app

Una vez que la nueva versión está disponible en Play Store (o cuando quieras que los usuarios vean el banner de actualización):

```bash
npm run release:publish
```

Este comando cambia `published: false` → `published: true` en el `version.json` de Supabase. A partir de ese momento, cualquier usuario con una versión instalada menor a la publicada verá el banner de actualización.

### Sistema de versiones

| Archivo | Qué controla | Ejemplo |
|---------|-------------|---------|
| `app.json` → `version` | Versión visible (semver) | `1.0.25` |
| `app.json` → `android.versionCode` | Código numérico (auto por EAS) | `25` |
| Supabase `version.json` → `androidVersionCode` | Versión más reciente disponible | `25` |
| Supabase `version.json` → `published` | Si notificar a usuarios | `true` / `false` |

### Lógica del banner de actualización

La app muestra el banner cuando se cumplen **ambas** condiciones:
1. `published === true` en Supabase
2. La versión instalada (`versionCode` local) es menor a `androidVersionCode` en Supabase

Esto permite controlar cuándo notificar independientemente de cuándo se sube el APK.

---

## Convenciones

- **Español neutro sin voseo** en textos visibles ("puedes", no "podés")
- **Nunca hardcodear texto** en JSX — usar `t()` de `useI18n`, claves en `packages/shared/src/i18n/es.json` y `en.json`
- TypeScript strict, `any` prohibido
- Lógica y queries a Supabase en hooks, no en componentes
- Códigos `FWC`, `CC`, `00` no son selecciones — se excluyen de conteos de equipos

---

## Estructura

```
mi-album-fifa/
├── apps/
│   ├── web/                  # React 18 + Vite + Tailwind v4
│   └── mobile/               # Expo SDK 56 + React Native
│       └── app/              # Rutas (expo-router)
├── packages/
│   └── shared/               # @mi-album-fifa/shared
│       └── src/
│           ├── data/         # stickers, flags, curiosities
│           ├── hooks/        # factory hooks
│           ├── i18n/         # es.json, en.json
│           └── lib/          # externalQR.ts, shared utils
└── supabase/
    ├── schema.sql            # ejecutar en SQL Editor
    └── functions/            # Edge Functions Deno
```

---

Desarrollado con ❤️ por Studio84
