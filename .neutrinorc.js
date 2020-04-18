const airbnbBase = require('@neutrinojs/airbnb-base');
const library = require('@neutrinojs/library');
const jest = require('@neutrinojs/jest');
const typescript = require('neutrino-typescript');
const typescriptLint = require('neutrino-typescript-eslint');

module.exports = {
  options: {
    root: __dirname,
    tests: 'src',
  },
  use: [
    typescript({ declaration: true }),
    typescriptLint(),
    airbnbBase({
      eslint: {
        rules: {
          'arrow-parens': ['error', 'always'],
          'operator-linebreak': ['error', 'after'],
          '@typescript-eslint/indent': ['error', 2],
          '@typescript-eslint/await-thenable': ['error'],
          '@typescript-eslint/ban-ts-ignore': ['error'],
          '@typescript-eslint/member-ordering': ['error'],
          '@typescript-eslint/no-for-in-array': ['error'],
          '@typescript-eslint/no-require-imports': ['error'],
          '@typescript-eslint/no-this-alias': ['error'],
          '@typescript-eslint/no-unnecessary-qualifier': ['error'],
          '@typescript-eslint/no-unnecessary-type-assertion': ['error'],
          '@typescript-eslint/no-non-null-assertion': ['off'],
          '@typescript-eslint/prefer-function-type': ['error'],
          '@typescript-eslint/prefer-includes': ['error'],
          '@typescript-eslint/prefer-regexp-exec': ['error'],
          '@typescript-eslint/prefer-string-starts-ends-with': ['error'],
          '@typescript-eslint/require-array-sort-compare': ['error'],
          '@typescript-eslint/restrict-plus-operands': ['error'],
          '@typescript-eslint/unbound-method': ['error'],
          '@typescript-eslint/explicit-function-return-type': ['error', {
            'allowTypedFunctionExpressions': true,
            'allowHigherOrderFunctions': true,
          }],
          '@typescript-eslint/no-parameter-properties': ['error', {
            'allows': ['private readonly', 'protected readonly'],
          }],
          'jest/expect-expect': ['off'],
        },
        baseConfig: {
          overrides: [{
            files: ['**/*.test.*'],
            rules: {
              'import/no-extraneous-dependencies': ['error', {
                'devDependencies': true,
              }],
            },
          }],
        },
      },
    }),
    library({
      name: 'shared-reducer-backend',
      target: 'node',
      babel: {
        presets: [
          ['@babel/preset-env', {
            useBuiltIns: false,
            targets: {
              node: '12.13',
            },
          }],
        ],
      },
    }),
    jest(),
  ],
};
