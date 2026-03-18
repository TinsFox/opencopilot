import { builtinModules } from 'node:module'
import { defineConfig } from 'tsdown'

const nodeExternals = [
  ...builtinModules,
  ...builtinModules.map((moduleName) => `node:${moduleName}`)
]
const externals = [
  'electron',
  'electron-updater',
  '@electron-toolkit/preload',
  '@electron-toolkit/utils',
  ...nodeExternals
]

export default defineConfig([
  {
    entry: {
      index: './main/index.ts'
    },
    outDir: './dist/main',
    format: 'cjs',
    fixedExtension: true,
    platform: 'node',
    target: 'node22',
    clean: true,
    dts: false,
    deps: {
      neverBundle: externals
    }
  },
  {
    entry: {
      index: './preload/index.ts'
    },
    outDir: './dist/preload',
    format: 'cjs',
    fixedExtension: true,
    platform: 'node',
    target: 'node22',
    clean: false,
    dts: false,
    deps: {
      neverBundle: externals
    }
  }
])
