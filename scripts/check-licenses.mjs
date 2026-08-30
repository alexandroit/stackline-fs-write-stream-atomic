import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const packageMetadata = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const dependencyMetadata = JSON.parse(await readFile(new URL('../node_modules/graceful-fs/package.json', import.meta.url), 'utf8'))
assert.equal(packageMetadata.license, 'ISC')
assert.deepEqual(packageMetadata.dependencies, {
  'graceful-fs': 'npm:@stackline/graceful-fs@1.0.0'
})
assert.equal(dependencyMetadata.name, '@stackline/graceful-fs')
assert.equal(dependencyMetadata.version, '1.0.0')
assert.equal(dependencyMetadata.license, 'ISC')
const notice = await readFile(new URL('../THIRD_PARTY_LICENSES.md', import.meta.url), 'utf8')
assert.match(notice, /@stackline\/graceful-fs[\s\S]*1\.0\.0/)
assert.match(notice, /ISC/)
console.log('Production license inventory passed: package ISC plus @stackline/graceful-fs@1.0.0 ISC.')
