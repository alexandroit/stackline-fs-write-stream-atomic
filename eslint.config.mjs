import js from '@eslint/js'

const globals = {
  Buffer: 'readonly',
  URL: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  console: 'readonly',
  module: 'readonly',
  process: 'readonly',
  require: 'readonly',
  setImmediate: 'readonly',
  setTimeout: 'readonly'
}

export default [
  { ignores: ['coverage/**', 'node_modules/**', 'release-candidate/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: { ecmaVersion: 2020, sourceType: 'commonjs', globals },
    rules: { 'no-unused-vars': ['error', { caughtErrors: 'none' }] }
  },
  {
    files: ['**/*.mjs'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals },
    rules: { 'no-unused-vars': ['error', { caughtErrors: 'none' }] }
  }
]
