'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const gracefulFs = require('graceful-fs')
const createWriteStreamAtomic = require('../index.js')
const { adjacentTemporaryFiles, makeDirectory, outcome, removeDirectory } = require('./helpers.cjs')

test('the existing target remains visible until the replacement is complete', async (t) => {
  const directory = makeDirectory('stackline-fswsa-visibility-')
  const target = path.join(directory, 'state')
  t.after(() => removeDirectory(directory))
  fs.writeFileSync(target, 'old')

  const stream = createWriteStreamAtomic(target)
  stream.write('new')
  assert.equal(fs.readFileSync(target, 'utf8'), 'old')
  assert.equal(path.dirname(stream.__atomicTmp), directory)
  assert.ok(path.basename(stream.__atomicTmp).startsWith('state.'))

  const completed = outcome(stream)
  stream.end(' value')
  await completed
  assert.equal(fs.readFileSync(target, 'utf8'), 'new value')
})

test('write callbacks, backpressure, finish, and close retain Writable ordering', async (t) => {
  const directory = makeDirectory('stackline-fswsa-backpressure-')
  const target = path.join(directory, 'large')
  t.after(() => removeDirectory(directory))

  const stream = createWriteStreamAtomic(target, { highWaterMark: 16 })
  const events = []
  stream.on('drain', () => events.push('drain'))
  stream.on('finish', () => events.push('finish'))
  stream.on('close', () => events.push('close'))
  const completed = outcome(stream)
  const payload = Buffer.alloc(256 * 1024, 0x61)
  const accepted = stream.write(payload, () => events.push('write-callback'))
  assert.equal(accepted, false)
  stream.end(Buffer.from('tail'))
  const result = await completed

  assert.equal(result.error, null)
  assert.ok(events.indexOf('write-callback') < events.indexOf('finish'))
  assert.ok(events.indexOf('finish') < events.indexOf('close'))
  assert.equal(fs.statSync(target).size, payload.length + 4)
})

test('append flags retain upstream replacement semantics rather than appending to target', async (t) => {
  const directory = makeDirectory('stackline-fswsa-append-')
  const target = path.join(directory, 'target')
  t.after(() => removeDirectory(directory))
  fs.writeFileSync(target, 'old')

  const stream = createWriteStreamAtomic(target, { flags: 'a' })
  const completed = outcome(stream)
  stream.end('new')
  const result = await completed

  assert.equal(result.error, null)
  assert.equal(fs.readFileSync(target, 'utf8'), 'new')
  assert.deepEqual(adjacentTemporaryFiles(target), [])
})

test('finish waits for the physical temporary stream close', async (t) => {
  const directory = makeDirectory('stackline-fswsa-slow-close-')
  const target = path.join(directory, 'target')
  t.after(() => removeDirectory(directory))
  fs.writeFileSync(target, 'old')

  const originalCreateWriteStream = gracefulFs.createWriteStream
  gracefulFs.createWriteStream = function (...arguments_) {
    const physical = originalCreateWriteStream.apply(this, arguments_)
    const originalEmit = physical.emit
    physical.emit = function (event, ...values) {
      if (event === 'close') {
        setTimeout(() => originalEmit.call(this, event, ...values), 30)
        return true
      }
      return originalEmit.call(this, event, ...values)
    }
    return physical
  }
  t.after(() => { gracefulFs.createWriteStream = originalCreateWriteStream })

  const started = Date.now()
  const stream = createWriteStreamAtomic(target)
  const completed = outcome(stream)
  stream.end('new')
  await new Promise((resolve) => setTimeout(resolve, 10))
  assert.equal(fs.readFileSync(target, 'utf8'), 'old')
  const result = await completed
  assert.equal(result.error, null)
  assert.ok(Date.now() - started >= 25)
  assert.equal(fs.readFileSync(target, 'utf8'), 'new')
})
