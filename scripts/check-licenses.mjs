import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const packageMetadata = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const dependencyMetadata = JSON.parse(await readFile(new URL('../node_modules/graceful-fs/package.json', import.meta.url), 'utf8'))
assert.equal(packageMetadata.license, 'ISC')
assert.equal(dependencyMetadata.name, 'graceful-fs')
assert.equal(dependencyMetadata.version, '4.2.11')
assert.equal(dependencyMetadata.license, 'ISC')
const notice = await readFile(new URL('../THIRD_PARTY_LICENSES.md', import.meta.url), 'utf8')
assert.match(notice, /graceful-fs[\s\S]*4\.2\.11/)
assert.match(notice, /ISC/)
console.log('Production license inventory passed: package ISC plus graceful-fs@4.2.11 ISC.')
