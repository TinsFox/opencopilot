# opencopilot

Monorepo for the OpenCopilot desktop app. `apps/electron` owns the Electron runtime, packaging and updates. `apps/web` owns the Vite renderer built with TanStack Router.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# Build renderer + Electron bundles
$ pnpm build

# Package for Windows
$ pnpm build:win

# Package for macOS
$ pnpm build:mac

# Package for Linux
$ pnpm build:linux
```
