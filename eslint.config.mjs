import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import globals from 'globals'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const tsFiles = ['**/*.{ts,tsx,mts,cts}']
const typeCheckedFiles = [
  'apps/web/**/*.{ts,tsx}',
  'apps/electron/src/main/**/*.ts',
  'apps/electron/src/preload/index.ts',
  'packages/shared/**/*.ts'
]
const nodeFiles = [
  'eslint.config.mjs',
  'apps/web/vite.config.ts',
  'apps/electron/tsdown.config.ts',
  'apps/electron/scripts/**/*.mjs',
  'apps/electron/src/main/**/*.ts'
]

const tsRecommendedRules = {
  ...tseslint.configs.recommended[1].rules,
  ...tseslint.configs.recommended[2].rules
}

const tsTypeCheckedRules = tseslint.configs.recommendedTypeChecked[2].rules

export default [
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/dist-dev',
      '**/out',
      '**/.turbo',
      '**/coverage',
      '**/routeTree.gen.ts'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,mts,cts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  },
  {
    files: tsFiles,
    languageOptions: {
      parser: tseslint.parser
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      ...tsRecommendedRules,
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports'
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ]
    }
  },
  {
    files: typeCheckedFiles,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: rootDir
      }
    },
    rules: {
      ...tsTypeCheckedRules,
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false
          }
        }
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowBoolean: true,
          allowNumber: true
        }
      ]
    }
  },
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactPlugin.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.flat.recommended.rules,
      ...reactRefresh.configs.vite.rules,
      'react/prop-types': 'off'
    }
  },
  {
    files: nodeFiles,
    languageOptions: {
      globals: globals.node
    }
  },
  {
    files: ['apps/electron/src/preload/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  }
]
