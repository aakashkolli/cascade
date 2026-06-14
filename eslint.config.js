import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      // Numbers, booleans, and nullish values are valid in template literals
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true, allowNullish: true },
      ],
      // Zustand store methods are designed to be destructured and called without `this`
      '@typescript-eslint/unbound-method': 'off',
      // no-unsafe-* rules produce excessive noise against Zustand selectors and test utilities
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      // Type assertions are used intentionally for canvas and Map narrowing
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    },
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'eslint.config.js'],
  },
);
