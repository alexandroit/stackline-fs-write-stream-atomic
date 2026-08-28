'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const baseline = require('fs-write-stream-atomic-upstream')
const candidate = require('../index.js')
const { makeDirectory, removeDirectory } = require('./helpers.cjs')

function exercise(factory, target, options, chunks) {
  return new Promise((resolve, reject) => {
    const events = []
    const stream = factory(target, options)
    stream.on('open', () => events.push('open'))
    stream.on('finish', () => events.push('finish'))
    stream.on('error', reject)
    stream.on('close', () => {
      events.push('close')
      resolve({
        content: fs.readFileSync(target, 'utf8'),
        events,
        mode: process.platform === 'win32' ? null : fs.statSync(target).mode & 0o777
      })
    })
    for (const chunk of chunks.slice(0, -1)) stream.write(chunk)
    stream.end(chunks[chunks.length - 1])
  })
}

test('candidate matches the 1.0.10 content, event, and option contract', async (t) => {
  const directory = makeDirectory('stackline-fswsa-differential-')
  t.after(() => removeDirectory(directory))
  const cases = [
    { name: 'default', options: undefined, chunks: ['one', 'two', 'three'] },
    { name: 'encoding', options: { encoding: 'utf8', highWaterMark: 1 }, chunks: ['å', 'ß'] },
    { name: 'mode', options: { mode: 0o640 }, chunks: ['mode'] },
    { name: 'append', options: { flags: 'a' }, chunks: ['replacement'] }
  ]

  for (const scenario of cases) {
    const oldContent = 'existing'
    const baselineTarget = path.join(directory, `${scenario.name}-baseline`)
    const candidateTarget = path.join(directory, `${scenario.name}-candidate`)
    fs.writeFileSync(baselineTarget, oldContent)
    fs.writeFileSync(candidateTarget, oldContent)
    const expected = await exercise(baseline, baselineTarget, scenario.options, scenario.chunks)
    const actual = await exercise(candidate, candidateTarget, scenario.options, scenario.chunks)
    assert.deepEqual(actual, expected, scenario.name)
  }
})
