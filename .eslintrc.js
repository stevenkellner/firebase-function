module.exports = {
  env: {
    browser: false,
    es2021: true,
    node: true
  },
  plugins: [
    '@typescript-eslint'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  ignorePatterns: [
    '/lib/**/*',
    '/.eslintrc.js',
    '/coverage/**/*'
  ],
  extends: [
    'eslint:all',
    'plugin:@typescript-eslint/all'
  ],
  rules: {
    '@typescript-eslint/object-curly-spacing': ['error', 'always'],
    '@typescript-eslint/quotes': ['error', 'single'],
    'function-call-argument-newline': ['error', 'consistent'],
    'padded-blocks': ['error', 'never'],
    '@typescript-eslint/no-unused-expressions': 'off',
    'max-len': 'off',
    'quote-props': ['error', 'consistent-as-needed'],
    'object-property-newline': 'off',
    'sort-keys': 'off',
    'one-var': ['error', 'never'],
    'max-lines-per-function': 'off',
    '@typescript-eslint/no-magic-numbers': 'off',
    'max-statements': 'off',
    'arrow-parens': ['error', 'as-needed'],
    '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    'max-classes-per-file': 'off',
    'func-style': ['error', 'declaration'],
    '@typescript-eslint/space-before-function-paren': ['error', { 'anonymous': 'always', 'named': 'never', 'asyncArrow': 'always' }],
    '@typescript-eslint/parameter-properties': 'off',
    '@typescript-eslint/no-namespace': 'off',
    'curly': ['error', 'multi-or-nest'],
    'nonblock-statement-body-position': ['error', 'below'],
    'new-cap': 'off',
    'array-element-newline': 'off',
    '@typescript-eslint/sort-type-constituents': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'no-ternary': 'off',
    'multiline-ternary': 'off',
    'no-confusing-arrow': 'off',
    'max-lines': 'off',
    'id-length': ['error', { 'exceptions': ['i', 'j'] }],
    'no-plusplus': ['error', { 'allowForLoopAfterthoughts': true }],
    '@typescript-eslint/method-signature-style': ['error', 'method'],
    'class-methods-use-this': 'off',
    'max-params': 'off',
    'function-paren-newline': ['error', 'consistent'],
    '@typescript-eslint/no-type-alias': 'off',
    'object-shorthand': ['error', 'never'],
    '@typescript-eslint/no-unnecessary-qualifier': 'off',
    'dot-location': ['error', 'property'],
    'no-inner-declarations': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-redeclare': 'off',
    'no-mixed-operators': 'off',
    'no-bitwise': 'off',
    'radix': 'off',
    'no-underscore-dangle': 'off',
    '@typescript-eslint/no-inferrable-types': 'off'
  }
}
