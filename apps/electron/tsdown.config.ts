import { builtinModules } from 'node:module'
import { defineConfig } from 'tsdown'

const distRoot = process.env.OPENCOPILOT_ELECTRON_DIST_ROOT ?? './dist'
const nodeExternals = [
  ...builtinModules,
  ...builtinModules.map((moduleName) => `node:${moduleName}`)
]
const externals = [
  'electron',
  'electron-updater',
  ...nodeExternals
]
const alwaysBundle = ['@opencopilot/shared']

export default defineConfig([
  {
    entry: {
      index: './src/main/index.ts'
    },
    outDir: `${distRoot}/main`,
    format: 'cjs',
    fixedExtension: true,
    platform: 'node',
    target: 'node22',
    clean: true,
    dts: false,
    deps: {
      alwaysBundle,
      neverBundle: externals
    }
  },
  {
    entry: {
      index: './src/preload/index.ts'
    },
    outDir: `${distRoot}/preload`,
    format: 'cjs',
    fixedExtension: true,
    platform: 'node',
    target: 'node22',
    clean: false,
    dts: false,
    deps: {
      alwaysBundle,
      neverBundle: externals
    }
  }
])
