'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { Readable, pipeline } = require('node:stream')
const { test } = require('node:test')
const gracefulFs = require('graceful-fs')
const createWriteStreamAtomic = require('../index.js')
const { adjacentTemporaryFiles, makeDirectory, outcome, removeDirectory } = require('./helpers.cjs')

test('explicit destroy closes the stream and removes its temporary file', async (t) => {
  const directory = makeDirectory('stackline-fswsa-destroy-')
  const target = path.join(directory, 'target')
  t.after(() => removeDirectory(directory))
  fs.writeFileSync(target, 'old')

  const stream = createWriteStreamAtomic(target)
  const completed = outcome(stream)
  const writeCompleted = new Promise((resolve) => {
    stream.write(Buffer.alloc(64 * 1024, 0x61), resolve)
  })
  stream.destroy()
  const result = await completed
  const writeError = await writeCompleted

  assert.equal(result.error, null)
  assert.equal(writeError.code, 'ERR_STREAM_DESTROYED')
  assert.equal(result.events.includes('finish'), false)
  assert.equal(fs.readFileSync(target, 'utf8'), 'old')
  assert.deepEqual(adjacentTemporaryFiles(target), [])
})

test('pipeline forwards a source error into destination cleanup', async (t) => {
  const directory = makeDirectory('stackline-fswsa-pipeline-')
  const target = path.join(directory, 'target')
  t.after(() => removeDirectory(directory))
  fs.writeFileSync(target, 'old')

  let sent = false
  const source = new Readable({
    read() {
      if (sent) return
      sent = true
      this.push('partial')
      process.nextTick(() => this.destroy(new Error('source failed')))
    }
  })
  const destination = createWriteStreamAtomic(target)
  const destinationClosed = outcome(destination)
  const error = await new Promise((resolve) => pipeline(source, destination, resolve))
  const destinationResult = await destinationClosed

  assert.equal(error.message, 'source failed')
  assert.equal(destinationResult.error.message, 'source failed')
  assert.deepEqual(destinationResult.events.slice(-2), ['error', 'close'])
  assert.equal(fs.readFileSync(target, 'utf8'), 'old')
  assert.deepEqual(adjacentTemporaryFiles(target), [])
})

test('rename errors emit error then close, never finish, and clean up', async (t) => {
  const directory = makeDirectory('stackline-fswsa-rename-error-')
  const target = path.join(directory, 'target')
  t.after(() => removeDirectory(directory))
  fs.writeFileSync(target, 'old')

  const originalRename = gracefulFs.rename
  gracefulFs.rename = (from, to, callback) => {
    const error = new Error('rename failed')
    error.code = 'EACCES'
    error.syscall = 'rename'
    process.nextTick(() => callback(error))
  }
  t.after(() => { gracefulFs.rename = originalRename })

  const stream = createWriteStreamAtomic(target)
  const completed = outcome(stream)
  stream.end('new')
  const result = await completed

  assert.equal(result.error.message, 'rename failed')
  assert.equal(result.events.includes('finish'), false)
  assert.deepEqual(result.events.slice(-2), ['error', 'close'])
  assert.equal(fs.readFileSync(target, 'utf8'), 'old')
  assert.deepEqual(adjacentTemporaryFiles(target), [])
})

test('chown errors are surfaced and clean up before rename', { skip: process.platform === 'win32' }, async (t) => {
  const directory = makeDirectory('stackline-fswsa-chown-error-')
  const target = path.join(directory, 'target')
  t.after(() => removeDirectory(directory))

  const originalChown = gracefulFs.chown
  gracefulFs.chown = (filename, uid, gid, callback) => {
    const error = new Error('chown failed')
    error.code = 'EPERM'
    process.nextTick(() => callback(error))
  }
  t.after(() => { gracefulFs.chown = originalChown })

  const stream = createWriteStreamAtomic(target, { chown: { gid: process.getgid(), uid: process.getuid() } })
  const completed = outcome(stream)
  stream.end('new')
  const result = await completed

  assert.equal(result.error.message, 'chown failed')
  assert.equal(fs.existsSync(target), false)
  assert.deepEqual(adjacentTemporaryFiles(target), [])
})

test('a physical open error reaches pending write callbacks and closes cleanly', async (t) => {
  const directory = makeDirectory('stackline-fswsa-open-error-')
  const target = path.join(directory, 'missing', 'target')
  t.after(() => removeDirectory(directory))

  const stream = createWriteStreamAtomic(target, { highWaterMark: 1 })
  const completed = outcome(stream)
  const writeCompleted = new Promise((resolve) => stream.write('value', resolve))
  stream.end()
  const result = await completed
  const writeError = await writeCompleted

  assert.equal(result.error.code, 'ENOENT')
  assert.equal(writeError.code, 'ENOENT')
  assert.deepEqual(result.events.slice(-2), ['error', 'close'])
  assert.equal(result.events.includes('finish'), false)
})
