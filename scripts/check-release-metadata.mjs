import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'

const metadata = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const decision = JSON.parse(await readFile(new URL('../decision.json', import.meta.url), 'utf8'))

assert.equal(metadata.name, '@stackline/fs-write-stream-atomic')
assert.equal(metadata.version, '1.0.0')
assert.equal(metadata.license, 'ISC')
assert.equal(metadata.engines.node, '>=14.15.1')
assert.equal(decision.decision, 'GO')
assert.ok(['BUILDING', 'PUBLISHED'].includes(decision.canonicalState))
assert.equal(decision.userPin.resolution, 'NOT_PINNED')
if (decision.canonicalState === 'BUILDING') assert.equal(decision.publication.npmPublished, false)
await Promise.all(metadata.files.map((filename) => access(new URL(`../${filename}`, import.meta.url))))
console.log('Frozen decision and package file inventory passed.')
