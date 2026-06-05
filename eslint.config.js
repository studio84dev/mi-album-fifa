import js from '@eslint/js'
import globals from 'globals'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const sharedRules = {
  ...reactPlugin.configs.recommended.rules,
  ...reactHooks.configs.recommended.rules,
  'react/react-in-jsx-scope': 'off',
  'react/prop-types': 'off',
  'no-unused-vars': [
    'warn',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      ignoreRestSiblings: true,
    },
  ],
  'no-console': 'warn',
  'react-hooks/set-state-in-effect': 'off',
  '@typescript-eslint/no-unused-vars': [
    'warn',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      ignoreRestSiblings: true,
    },
  ],
  '@typescript-eslint/no-explicit-any': 'error',
}

const sharedPlugins = {
  react: reactPlugin,
  'react-hooks': reactHooks,
}

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['apps/web/**/*.{js,jsx,ts,tsx}'],
    plugins: sharedPlugins,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2022 },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        tsconfigRootDir: resolve(__dirname, 'apps/web'),
      },
    },
    settings: { react: { version: 'detect' } },
    rules: sharedRules,
  },
  {
    files: ['packages/shared/**/*.{ts,tsx}'],
    plugins: sharedPlugins,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.es2022 },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        tsconfigRootDir: resolve(__dirname, 'packages/shared'),
      },
    },
    settings: { react: { version: 'detect' } },
    rules: sharedRules,
  },
  {
    ignores: ['**/dist/', '**/node_modules/', 'apps/mobile/'],
  },
]
