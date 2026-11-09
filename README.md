# Hue Dat Boy - Color Contrast Checker for WCAG & APCA

**Website:** [huedatboy.com](https://huedatboy.com/)

Hue Dat Boy is a color contrast checker for WCAG 2.2 and APCA. The whole interface is themed with the colors you're testing, so you see the pair in context instead of in a little preview box.

## Features

- **Contrast checking** against WCAG 2.2 (AA/AAA, normal and large text) and APCA (body text, large text, icons), with a meter showing how far you are from each level.
- **Transparency support**: semi-transparent text is blended, and semi-transparent backgrounds show their full possible range and are judged by the worst case.
- **Enhance contrast**: nudges the text, background, or both to the next level while keeping the hue (adjusts lightness in OKLCH).
- **Low contrast mode**: when the pair is too close to build an interface with, the UI switches to black or white and says why.
- **Previews** in any Google Font, under several color blindness simulations, with a fullscreen view.
- **Shareable URLs** (and a favicon) that follow the current colors.
- English, Spanish and Lithuanian.

## Getting started

This project uses [pnpm](https://pnpm.io/) and Node 24 or newer (production runs on Node 26).

```bash
git clone https://github.com/seanpstanley/hue-dat-boy.git
cd hue-dat-boy
pnpm install
cp .env.example .env.local # then add a Google Fonts API key
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The typeface picker needs a [Google Fonts Developer API](https://developers.google.com/fonts/docs/developer_api) key in `GOOGLE_FONTS_API_KEY`. Everything else works without it. If you have access to the Vercel project, `vercel env pull .env.local` fetches it.

### Scripts

| Command          | What it does                           |
| ---------------- | -------------------------------------- |
| `pnpm dev`       | Start the dev server                   |
| `pnpm build`     | Production build                       |
| `pnpm lint`      | ESLint (fails on warnings)             |
| `pnpm typecheck` | TypeScript, no emit                    |
| `pnpm test`      | Vitest in watch mode (`--run` once)    |
| `pnpm format`    | Prettier (also sorts Tailwind classes) |

## Project structure

```
app/
  [locale]/        the page, layout and 404 (one route, per locale)
  api/             route handlers proxying Google Fonts and Animechan
  globals.css      Tailwind 4 theme, including the dynamic color tokens
components/        feature components (the checker and its pieces)
  ui/              shadcn-style primitives, restyled for the dynamic theme
hooks/             React hooks (data fetching, media queries, recent colors)
i18n/              next-intl routing and request config
lib/               color math, contrast standards, theme and URL state
  utils/           generic helpers (cn, fetcher)
messages/          translations
test/              test setup and render helpers
```

### How the dynamic theme works

The user's colors can't be compiled into Tailwind, so `lib/theme.ts` turns them into CSS custom properties (`--surface`, `--ink`, `--on-ink`, `--sim-*`, ...) that the checker writes into an inline `<style>` tag. `globals.css` exposes those as Tailwind colors with `@theme inline`, so components use ordinary classes like `bg-ink` or `hover:text-on-ink`, and portaled popovers pick them up too. See the comment at the top of `globals.css`.

## Contributing

Contributions are welcome! Feel free to open an issue or a pull request for bugs or feature requests.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) and [Radix](https://www.radix-ui.com/).
- [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/) and [APCA](https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell) for the contrast standards.
- [Animechan](https://animechan.io/) for the sample quotes.
- [Vercel](https://vercel.com/) for hosting.
