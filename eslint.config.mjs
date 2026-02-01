// eslint.config.mjs
import tseslint from 'typescript-eslint';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';

export default [
  // Global ignores
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  // TypeScript linting
  ...tseslint.configs.strict,

  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.base.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@angular-eslint': angular,
    },
    rules: {
      // Angular recommended rules (manuell statt extends)
      ...angular.configs.recommended.rules,

      // TypeScript strict rules (manuell statt extends)
      ...tseslint.configs.strict[1].rules,

      // Deine eigenen Regeln
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@angular-eslint/use-lifecycle-interface': 'warn',
      '@angular-eslint/no-empty-lifecycle-method': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
];
