import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // Scoped to just the `any` safety net for now. Not pulling in
    // reactRefresh here to avoid surfacing unrelated pre-existing lint
    // violations that were never checked on .ts/.tsx files before.
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.base, reactHooks.configs['recommended-latest']],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // TODO: flip to 'error' once the codebase's ~500 pre-existing `any`
      // usages are cleaned up in phases; this warns so no new ones sneak in unnoticed.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
])
