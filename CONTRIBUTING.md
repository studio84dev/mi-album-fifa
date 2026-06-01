# Contributing to Mi Álbum FIFA ⚽

First of all — thank you for your interest in contributing ❤️

This project started as a small side project for football collectors and families during the FIFA World Cup 2026 sticker season, and every idea, bug report or improvement genuinely helps.

Whether you're fixing a typo, improving the UX, reporting bugs or building new features:
you're welcome here 🙌

---

# 🚀 Ways to Contribute

You can help by:

- reporting bugs
- improving accessibility
- suggesting UX/UI improvements
- improving mobile responsiveness
- translating content
- optimizing performance
- improving documentation
- building new features
- improving search and collection workflows

---

# 🛠️ Local Setup

## Requirements

- Node.js 18+
- npm
- TypeScript knowledge
- Supabase project (for auth/database features)

## Installation

```bash
git clone https://github.com/studio84dev/mi-album-fifa.git

cd mi-album-fifa

npm install
```

Create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run locally:

```bash
npm run dev
```

---

# 📦 Useful Commands

```bash
npm run dev        # Start development server
npm run build      # Production build (includes type-check)
npm run lint       # ESLint + TypeScript checks
npm run format     # Prettier formatting
```

---

# 🎨 Design & UX Philosophy

Mi Álbum FIFA is intentionally designed to be:

- mobile-first
- fast
- minimal
- clean
- easy to use during real-world sticker trading

Please try to preserve the existing UX consistency and simplicity when contributing.

Avoid:

- excessive visual effects
- unnecessary complexity
- heavy dependencies
- cluttered UI patterns

---

# ⚠️ Important UI Notice

Please discuss major UI/UX changes before opening a PR.

Large visual redesigns or navigation changes should be aligned first to preserve design consistency across the app.

---

# ✅ Contribution Guidelines

## Preferred Pull Requests

Small and focused PRs are preferred.

Examples:

- isolated bug fixes
- UX improvements
- accessibility improvements
- responsive fixes
- performance improvements
- new search capabilities
- documentation updates

---

# 🧹 Code Style

This project uses:

- **TypeScript** — strict mode enabled
- ESLint
- Prettier

Please run formatting before submitting a PR:

```bash
npm run format
```

And lint checks:

```bash
npm run lint
```

Format-on-save is recommended in your editor.

---

## 📝 TypeScript Guidelines

The codebase is fully typed in strict mode. Please keep it that way:

- **`any` is banned** — ESLint enforces `@typescript-eslint/no-explicit-any: 'error'`. No exceptions.
- Use interfaces for component props (naming convention: `*Props`)
- Use `useState<Type>` and `useRef<Type | null>` instead of relying on inference
- Use `Record<string, T>` over index signatures when possible
- Use **discriminated unions** for data with `kind` fields (e.g. `SearchResult = TeamCardResult | StickerCardResult`)
- Use **type guards** in `.filter()` calls to narrow types instead of casting
- Use exported union types (e.g. `CardType`) for fields with a fixed set of values — never `string`
- Import extensions: use `.ts` / `.tsx` in all import paths
- Run `npm run lint` before submitting — it enforces both ESLint and TypeScript rules

---

# 💡 Good First Issues

If you're new to open source, look for issues labeled:

- `good first issue`
- `help wanted`

These are intentionally beginner-friendly.

---

# 🐛 Reporting Bugs

When opening an issue, please include:

- steps to reproduce
- screenshots/videos if relevant
- browser/device information
- expected vs actual behavior

---

# 🌍 Internationalization

The app currently supports:

- English
- Spanish

Translation files live under:

```text
src/i18n/
```

Contributions for improving translations are welcome.

---

# ❤️ Community

Please be respectful and constructive.

This project is built for collectors, families and football fans around the world.

Let's keep the community friendly and welcoming 🙌

---

Thanks again for contributing ⚽
