import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const required = ['index.js', 'index.mjs', 'index.d.ts', 'index.d.cts', 'index.d.mts']
await Promise.all(required.map((filename) => access(new URL(`../${filename}`, import.meta.url))))
execFileSync(process.execPath, ['--check', 'index.js'], { cwd: root, stdio: 'inherit' })
const metadata = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
assert.equal(metadata.main, './index.js')
assert.equal(metadata.module, './index.mjs')
assert.equal(metadata.types, './index.d.ts')
console.log('Validated CommonJS, ESM, declarations, and package entry points.')
