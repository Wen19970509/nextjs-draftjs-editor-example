module.exports = {
    parser: '@typescript-eslint/parser',
    extends: ['next', 'prettier', 'plugin:@typescript-eslint/recommended'],
    rules: { '@typescript-eslint/no-explicit-any': 'off', 'prefer-const': 'off', 'react/no-unescaped-entities': 'off', 'react-hooks/rules-of-hooks': 'off' },
};
