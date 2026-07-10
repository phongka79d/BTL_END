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
    // ESLint Core không đánh dấu các định danh thành phần JSX là đã được sử dụng nếu thiếu plugin lint React.
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
