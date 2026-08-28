import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { once } from 'node:events'
import createWriteStreamAtomic, { WriteStreamAtomic } from '../index.mjs'

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'stackline-fswsa-esm-'))
try {
  const target = path.join(directory, 'esm')
  const stream = createWriteStreamAtomic(target)
  assert.ok(stream instanceof WriteStreamAtomic)
  stream.end('esm')
  await once(stream, 'close')
  assert.equal(fs.readFileSync(target, 'utf8'), 'esm')
  console.log('ESM default and named exports passed.')
} finally {
  fs.rmSync(directory, { force: true, recursive: true })
}
