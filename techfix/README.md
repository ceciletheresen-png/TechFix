# TechFix

A free, static troubleshooting website for everyday computer, phone and internet problems. It has **27 step-by-step guides**, **3 guided diagnoses**, client-side search, bookmarks and history. There is no backend, database, account, analytics or paid service: all content is local JSON.

## Features
- 10 categories (Windows, laptops, Android, iPhone/iOS, Wi-Fi, Bluetooth/peripherals, storage, software, audio/display, battery) with filters for category, device/OS and difficulty.
- Client-side search (case-insensitive, whitespace-normalised, debounced, with suggestions when nothing matches).
- Guides with symptoms, causes, tools, numbered steps with expected results, warnings, undo instructions, alternatives and related guides. Steps can be ticked off, but a guide is never marked "resolved" automatically.
- Data-driven diagnostic flows (Back, Restart, progress bar, professional-help advice).
- Bookmarks, recently viewed and local-only feedback in `localStorage` (validated; failures never crash the app).
- Responsive, keyboard-accessible, reduced-motion aware, WCAG 2.2 AA oriented.

## Technology
Angular 21 (standalone components, signals, strict TypeScript) · Tailwind CSS 4 · lucide-angular · Vitest (Angular's unit-test builder) · ESLint (angular-eslint, including template accessibility rules) · Prettier · GitHub Actions + GitHub Pages.

Node.js: 20.19+, 22.12+ or 24+ (`.nvmrc` pins 22.22.2). Angular 21 was chosen because `lucide-angular` 1.x declares support up to Angular 21.

## Quick start
```bash
npm ci
npm start          # http://localhost:4200
```
See [INSTALLATION.md](INSTALLATION.md) for prerequisites and Windows PowerShell commands.

## Commands
| Command | What it does |
| --- | --- |
| `npm start` | Dev server with live reload |
| `npm test` | Run all unit/component tests once (`npm run test:watch` to watch) |
| `npm run lint` | ESLint on TypeScript and inline templates |
| `npm run format` / `format:check` | Prettier |
| `npm run validate:content` | Check JSON ids, references and diagnostic flows (also runs before every build) |
| `npm run build` | Production build into `dist/techfix/browser` |

Interpreting failures: a failing test prints the spec file, test name and the expected vs received value. `validate:content` failures name the exact guide or flow node with the bad reference.

## Project layout
```
src/app/core/models       Typed interfaces (Category, TroubleshootingGuide, DiagnosticFlow, ...)
src/app/core/services     Guide, Search, Bookmark, History, Feedback, Diagnostic, SafeStorage
src/app/shared/components Cards, search box, callout, breadcrumbs, empty/loading states, icons
src/app/features          home, categories, guides (browse/search/detail), diagnostics, bookmarks, about
public/assets/data        categories.json, guides.json, diagnostic-flows.json
scripts/validate-content.mjs
```
Angular 21 serves static files from `public/`, so the data lives in `public/assets/data/` rather than `src/assets/`. Components use inline templates to keep each feature in one file.

## Adding content
Add a guide to `guides.json` (copy an existing one; `id` is `g-<slug>`), list related guide ids, then run `npm run validate:content`. Diagnostic flows are lists of `question` and `outcome` nodes; every option's `next` must be an existing node id, and the validator rejects dead ends, cycles and unreachable nodes.

## Deployment (GitHub Pages)
1. Push to GitHub and set **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main`. `.github/workflows/deploy.yml` runs `npm ci`, lint, tests and the build, then publishes `dist/techfix/browser`.
3. The site appears at `https://<user>.github.io/<repository>/`.

**Base path.** The workflow builds with `--base-href "/<repository-name>/"` taken from `github.event.repository.name`, so renaming the repository needs no code change. For a `<user>.github.io` repository or a custom domain, change it to `--base-href "/"`. To test locally under a subpath: `npm run build -- --base-href "/techfix/"`.

**Routing.** The app uses hash routing (`/#/guides/slow-wifi`). GitHub Pages cannot rewrite unknown paths to `index.html`, and hash URLs refresh and deep-link correctly with no `404.html` trick. Trade-off: URLs contain `#`. Unknown hash routes show the in-app "Page not found" page.

## Privacy and safety
No tracking, no third-party requests, no secrets. Bookmarks, history and feedback stay in the browser. Guides avoid disabling security software, registry edits, untrusted drivers and opening batteries or power supplies, and flag data-loss risks and when to call a technician.

## Troubleshooting installation
- **`npm install` fails with `Cannot read properties of null (reading 'edgesOut')`**: a bug in npm 10 when resolving new dependency trees. Use `npm ci` (works), or upgrade npm (`npm install -g npm@11`) before adding packages.
- **`The current Node.js version is not supported`**: install a Node version from the list above (`nvm use`).
- **Port 4200 busy**: `npm start -- --port 4300`.
- **Blank page after deploy / 404 for assets**: the base href does not match the repository name; see "Base path".

## License
MIT, see [LICENSE](LICENSE).
