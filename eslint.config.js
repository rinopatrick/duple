import svelte from 'eslint-plugin-svelte';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  { ignores: ['dist/**', 'src-tauri/**', 'node_modules/**', '*.config.*'] },
  {
    files: ['**/*.{js,ts,svelte}'],
    rules: {
      'no-unused-vars': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
    },
  },
  {
    files: ['**/*.svelte'],
    plugins: { svelte },
    languageOptions: { parser: svelte.parser },
    rules: {
      'svelte/no-at-html-tags': 'warn',
      'svelte/no-target-blank': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { '@typescript-eslint': ts },
    languageOptions: { parser: tsParser },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
