module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  ignorePatterns: ['dist/', 'node_modules/'],
  extends: ['eslint:recommended'],
  rules: {
    // Core ESLint does not mark JSX component identifiers as used without a React lint plugin.
    'no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^[A-Z]',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
};
