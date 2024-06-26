module.exports = {
  env: {
    'jest/globals': true,
    browser: true,
    commonjs: true,
    es2021: true,
  },
  plugins: ['jest'],
  extends: ['airbnb-base', 'eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {},
};
