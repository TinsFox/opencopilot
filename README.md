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
$ cat > apps/electron/.env << 'EOF'
ARK_API_KEY=your_volcengine_api_key
ARK_MODEL=your_doubao_endpoint_or_model_id
# Optional. Defaults to https://ark.cn-beijing.volces.com/api/v3
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
EOF

$ pnpm dev
```

The Electron main process loads `apps/electron/.env` and `apps/electron/.env.local` automatically. The app uses AI SDK with the OpenAI-compatible provider in `apps/electron`, so the API key stays in the main process instead of the renderer.

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
