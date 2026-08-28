'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const createWriteStreamAtomic = require('../index.js')
const { adjacentTemporaryFiles, makeDirectory, outcome, removeDirectory } = require('./helpers.cjs')

test('many contending large writers leave one complete result and no temporary files', async (t) => {
  const directory = makeDirectory('stackline-fswsa-stress-')
  const target = path.join(directory, 'target')
  t.after(() => removeDirectory(directory))
  const results = new Map()

  const completions = Array.from({ length: 24 }, (_, index) => {
    const marker = String(index).padStart(2, '0')
    const content = `${marker}:` + marker.repeat(32 * 1024)
    results.set(marker, content)
    const stream = createWriteStreamAtomic(target, { highWaterMark: 1024 })
    const completed = outcome(stream)
    for (let offset = 0; offset < content.length; offset += 997) {
      stream.write(content.slice(offset, offset + 997))
    }
    stream.end()
    return completed
  })

  const outcomes = await Promise.all(completions)
  assert.ok(outcomes.every((result) => result.error === null))
  const actual = fs.readFileSync(target, 'utf8')
  const winner = actual.slice(0, 2)
  assert.equal(actual, results.get(winner))
  assert.deepEqual(adjacentTemporaryFiles(target), [])
})
