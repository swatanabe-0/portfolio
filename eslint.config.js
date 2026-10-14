import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  // 対象外：ビルド結果、依存パッケージ、手元の保管用
  { ignores: ['dist/', 'node_modules/', 'legacy/', 'public/'] },

  js.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser }
    },
    rules: {
      // 使っていない変数は警告（意図して使わない引数は、先頭に _ を付ける）
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      'prefer-const': 'warn',
      eqeqeq: ['warn', 'always', { null: 'ignore' }]
    }
  },

  // 設定ファイル自体は Node.js 上で動く
  {
    files: ['eslint.config.js'],
    languageOptions: { globals: { ...globals.node } }
  },

  // Prettier と競合する整形系のルールを無効にする（最後に置く）
  prettier
];
