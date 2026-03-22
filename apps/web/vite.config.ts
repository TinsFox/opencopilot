import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    codeInspectorPlugin({
      bundler: 'vite',
      exclude: [
        /src\/components\/ui\//,
        /node_modules/,
        /src\/components\/ai-elements\//,
      ],
    }),
    tailwindcss(),
    react(),
    tsconfigPaths(),
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: '../electron/dist/renderer',
    emptyOutDir: true,
  },
})
