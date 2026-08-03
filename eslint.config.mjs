import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import importX from 'eslint-plugin-import-x';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';

/**
 * Flat config (ESLint 10). Replaces the former .eslintrc.json + airbnb-base setup:
 * eslintrc is gone in v10 and airbnb-base has not shipped since 2022.
 *
 * Formatting is Prettier's job (see .prettierrc). The @stylistic rules kept here are
 * only the ones that encode a decision Prettier cannot make for us.
 */
export default [
  {
    ignores: ['dist/**', 'dist-archive/**', 'docs/assets/**', 'ts-types/**', '**/*.min.js'],
  },

  js.configs.recommended,
  importX.flatConfigs.recommended,

  {
    files: ['src/**/*.js'],

    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        VirtualSelect: 'readonly',
        PopoverComponent: 'readonly',
      },
    },

    plugins: {
      '@stylistic': stylistic,
      sonarjs,
    },

    rules: {
      // Best-practice rules inherited from airbnb-base. Kept explicitly so the
      // eslint-disable comments scattered through src/ stay meaningful.
      'class-methods-use-this': 'error',
      'no-console': 'warn',
      'no-param-reassign': ['error', { props: true }],
      'no-unused-expressions': ['error', { allowShortCircuit: false, allowTernary: false }],
      'no-var': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-const': 'error',
      'prefer-template': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      // ESLint 10 dropped the "as-needed" option; parseInt() call sites now pass 10 explicitly.
      radix: 'error',

      'sonarjs/no-all-duplicated-branches': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-collection-size-mischeck': 'error',
      'sonarjs/no-duplicated-branches': 'error',
      'sonarjs/no-element-overwrite': 'error',
      'sonarjs/no-empty-collection': 'error',
      'sonarjs/no-identical-expressions': 'error',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-inverted-boolean-check': 'error',
      'sonarjs/no-nested-switch': 'error',
      'sonarjs/no-nested-template-literals': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-small-switch': 'error',
      'sonarjs/no-unused-collection': 'error',
      'sonarjs/no-use-of-empty-return-value': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/prefer-object-literal': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',

      '@stylistic/linebreak-style': ['error', 'unix'],
      '@stylistic/max-len': ['error', { code: 120 }],
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/object-curly-newline': ['error', { ObjectPattern: { multiline: true } }],
      '@stylistic/operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }],
      '@stylistic/quote-props': ['error', 'consistent'],
    },
  },
];
