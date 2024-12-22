import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from '@stylistic/eslint-plugin'

export default [
    {
        files: [
            "**/*.{js,mjs,cjs,ts}"
        ]
    },
    {
        ignores: [
            "lib/*",
            "lib/**/*",
            "eslint.config.mjs",
            ".mocharc.js",
            "nyc.config.js",
            "coverage/*",
            "coverage/**/*",
        ]
    },
    {
        languageOptions:
        {
            globals: {
                ...globals.browser,
                ...globals.node
            },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname
            }
        }
    },
    pluginJs.configs.all,
    ...tseslint.configs.all,
    stylistic.configs["all-flat"],
    stylistic.configs.customize({
        indent: 4,
        quotes: 'single',
        semi: true,
        braceStyle: '1tbs',
        quoteProps: 'as-needed'
    }),
    {
        rules: {
            '@typescript-eslint/consistent-indexed-object-style': 'off',
            'function-call-argument-newline': ['error', 'consistent'],
            'no-undefined': 'off',
            '@typescript-eslint/no-invalid-void-type': 'off',
            'no-void': 'off',
            'newline-per-chained-call': 'off',
            '@typescript-eslint/unified-signatures': 'off',
            'padded-blocks': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            'multiline-comment-style': 'off',
            '@typescript-eslint/member-ordering': 'off',
            'max-len': 'off',
            'quote-props': ['error', 'consistent-as-needed'],
            'object-property-newline': 'off',
            'sort-keys': 'off',
            'one-var': ['error', 'never'],
            'no-negated-condition': 'off',
            'max-lines-per-function': 'off',
            '@typescript-eslint/no-magic-numbers': 'off',
            'max-statements': 'off',
            'arrow-parens': ['error', 'as-needed'],
            '@typescript-eslint/prefer-readonly-parameter-types': 'off',
            'max-classes-per-file': 'off',
            'func-style': ['error', 'declaration'],
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
            '@typescript-eslint/no-inferrable-types': 'off',
            'capitalized-comments': 'off',
            '@typescript-eslint/no-redundant-type-constituents': 'off',
            '@typescript-eslint/prefer-destructuring': 'off',
            'sort-imports': 'off',
            'prefer-destructuring': 'off',
            'accessor-pairs': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-use-before-define': 'off',
            '@stylistic/function-call-argument-newline': ['error', 'consistent'],
            '@stylistic/array-element-newline': ['error', 'consistent'],
            '@stylistic/comma-dangle': ['error', 'never'],
            '@stylistic/padded-blocks': 'off',
            '@stylistic/function-paren-newline': ['error', 'consistent'],
            '@typescript-eslint/consistent-type-definitions': 'off',
            '@stylistic/nonblock-statement-body-position': ['error', 'below'],
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/max-params': 'off',
            '@typescript-eslint/init-declarations': 'off',
            'id-length': 'off',
            '@typescript-eslint/no-confusing-void-expression': 'off',
            'no-inline-comments': 'off',
            'func-style': 'off',
            '@typescript-eslint/no-unsafe-type-assertion': 'off'
        }
    }
];
