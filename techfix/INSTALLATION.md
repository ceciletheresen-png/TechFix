# Installation guide

## 1. System prerequisites
| Tool | Needed version | Check |
| --- | --- | --- |
| Node.js (includes npm) | 20.19+, 22.12+ or 24+ (22.22.2 recommended, see `.nvmrc`) | `node --version` · `npm --version` |
| Git | any recent version | `git --version` |
| Code editor | Visual Studio Code suggested | – |

The Angular CLI does **not** need a global install; the project uses the local copy through npm scripts.

### Installing missing prerequisites
**Windows (PowerShell):**
```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
winget install Microsoft.VisualStudioCode
```
Close and reopen PowerShell, then run the version checks above.

**macOS (Homebrew):** `brew install node@22 git`  
**Ubuntu/Debian:** install Node from [nodejs.org](https://nodejs.org) or `nvm`, then `sudo apt install git`.  
**With nvm:** `nvm install` then `nvm use` inside the project (reads `.nvmrc`).

## 2. Get the project and install dependencies
```bash
git clone <your-repository-url> techfix
cd techfix
npm ci
```
`npm ci` installs exactly what `package-lock.json` specifies. Use it for a fresh setup.

### What is installed
| Group | Packages |
| --- | --- |
| Angular | `@angular/{common,compiler,core,forms,platform-browser,router}` 21.2, `rxjs`, `tslib` |
| Icons | `lucide-angular` 1.0 (supports Angular 13–21) |
| Styling | `tailwindcss` 4.3, `@tailwindcss/postcss` 4.3, `postcss` |
| Tooling | `@angular/cli`, `@angular/build`, `@angular/compiler-cli`, `typescript` 5.9 |
| Testing | `vitest`, `jsdom` (used by `ng test`) |
| Quality | `eslint`, `@eslint/js`, `typescript-eslint`, `angular-eslint`, `prettier` |

### Tailwind CSS (already configured)
Tailwind 4 is wired through PostCSS for the Angular build:
- `.postcssrc.json` contains `{ "plugins": { "@tailwindcss/postcss": {} } }`
- `src/styles.css` starts with `@import 'tailwindcss';` followed by the `@theme` colour tokens.

To recreate it in another project: `npm install -D tailwindcss @tailwindcss/postcss postcss`, then add those two pieces.

### Icons
`npm install lucide-angular`. Icons are registered in `src/app/shared/components/icon.component.ts`; add an import and a map entry to use another Lucide icon (only listed icons are bundled).

## 3. Run
```bash
npm start            # http://localhost:4200
npm test             # all tests once
npm run lint
npm run build        # output: dist/techfix/browser
```

## 4. GitHub Actions and GitHub Pages
1. Create a repository and push (`git remote add origin <url>`, `git push -u origin main`).
2. Repository **Settings → Pages → Source: GitHub Actions**.
3. The workflow `.github/workflows/deploy.yml` needs no secrets. It requests `pages: write` and `id-token: write` itself.
4. Open the **Actions** tab, wait for "Deploy to GitHub Pages", then visit `https://<user>.github.io/<repository>/`.
5. If your production branch is not `main`, edit `branches:` in the workflow.

PowerShell example for the first push:
```powershell
git init -b main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<user>/<repository>.git
git push -u origin main
```
Commit `package-lock.json` (it is not ignored) so that `npm ci` works in CI.

## 5. Common installation errors
See "Troubleshooting installation" in the [README](README.md).
