module.exports = {
  env: {
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:json/recommended', 'plugin:prettier/recommended'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2020,
  },
  root: true,
  rules: {
    'prettier/prettier': 'warn',
  },
};
