// @ts-check
const eslint = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  // Global ignores - applies to all files
  { ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', '**/*.d.ts', '**/bin/**'] },

  // Base ESLint recommended rules for JS files
  { files: ['**/*.js', '**/*.mjs', '**/*.cjs'], ...eslint.configs.recommended },

  // Test files configuration - no type-aware linting (must come before general TypeScript config)
  // More specific patterns must come first in flat config
  {
    files: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // Don't use project for test files as they're not in tsconfig
      },
      globals: {
        // Node.js and Jest globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    plugins: { '@typescript-eslint': tsPlugin, prettier: prettierPlugin },
    rules: {
      // ESLint base rules
      ...eslint.configs.recommended.rules,

      // TypeScript ESLint recommended rules (without type-aware)
      ...tsPlugin.configs.recommended.rules,

      // Prettier rules
      ...prettierConfig.rules,
      'prettier/prettier': 'error',

      // Relaxed rules for tests
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-undef': 'off', // Jest globals
    },
  },

  // TypeScript files configuration (for src/ files)
  {
    files: ['**/*.ts'],
    ignores: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'], // Exclude test files
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
      },
    },
    plugins: { '@typescript-eslint': tsPlugin, prettier: prettierPlugin },
    rules: {
      // ESLint base rules
      ...eslint.configs.recommended.rules,

      // TypeScript ESLint recommended rules
      ...tsPlugin.configs.recommended.rules,

      // Prettier rules
      ...prettierConfig.rules,
      'prettier/prettier': 'error',

      // Custom overrides
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
