'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const gracefulFs = require('graceful-fs')
const createWriteStreamAtomic = require('../index.js')
const { adjacentTemporaryFiles, makeDirectory, outcome, removeDirectory } = require('./helpers.cjs')

function eperm(callback) {
  const error = new Error('simulated Windows rename EPERM')
  error.code = 'EPERM'
  error.syscall = 'rename'
  process.nextTick(() => callback(error))
}

test('Windows EPERM is accepted only when target and temporary contents match', async (t) => {
  const directory = makeDirectory('stackline-fswsa-eperm-match-')
  const target = path.join(directory, 'target')
  t.after(() => removeDirectory(directory))
  fs.writeFileSync(target, 'same')

  const originalRename = gracefulFs.rename
  gracefulFs.rename = (from, to, callback) => eperm(callback)
  t.after(() => { gracefulFs.rename = originalRename })

  const stream = createWriteStreamAtomic(target, { isWin: true })
  const completed = outcome(stream)
  stream.end('same')
  const result = await completed

  assert.equal(result.error, null)
  assert.deepEqual(result.events.slice(-2), ['finish', 'close'])
  assert.equal(fs.readFileSync(target, 'utf8'), 'same')
  assert.deepEqual(adjacentTemporaryFiles(target), [])
})

test('Windows EPERM with different content remains an error', async (t) => {
  const directory = makeDirectory('stackline-fswsa-eperm-different-')
  const target = path.join(directory, 'target')
  t.after(() => removeDirectory(directory))
  fs.writeFileSync(target, 'old')

  const originalRename = gracefulFs.rename
  gracefulFs.rename = (from, to, callback) => eperm(callback)
  t.after(() => { gracefulFs.rename = originalRename })

  const stream = createWriteStreamAtomic(target, { isWin: true })
  const completed = outcome(stream)
  stream.end('new')
  const result = await completed

  assert.equal(result.error.code, 'EPERM')
  assert.equal(result.events.includes('finish'), false)
  assert.equal(fs.readFileSync(target, 'utf8'), 'old')
  assert.deepEqual(adjacentTemporaryFiles(target), [])
})

test('Windows EPERM with a missing target remains the original rename error', async (t) => {
  const directory = makeDirectory('stackline-fswsa-eperm-missing-')
  const target = path.join(directory, 'target')
  t.after(() => removeDirectory(directory))

  const originalRename = gracefulFs.rename
  gracefulFs.rename = (from, to, callback) => eperm(callback)
  t.after(() => { gracefulFs.rename = originalRename })

  const stream = createWriteStreamAtomic(target, { isWin: true })
  const completed = outcome(stream)
  stream.end('new')
  const result = await completed

  assert.equal(result.error.code, 'EPERM')
  assert.equal(result.events.includes('finish'), false)
  assert.equal(fs.existsSync(target), false)
  assert.deepEqual(adjacentTemporaryFiles(target), [])
})
