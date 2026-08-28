'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const { Writable } = require('node:stream')
const createWriteStreamAtomic = require('../index.js')
const { adjacentTemporaryFiles, makeDirectory, outcome, removeDirectory } = require('./helpers.cjs')

test('the historical factory remains callable and newable', async (t) => {
  const directory = makeDirectory('stackline-fswsa-shape-')
  t.after(() => removeDirectory(directory))

  const called = createWriteStreamAtomic(path.join(directory, 'called'))
  const constructed = new createWriteStreamAtomic(path.join(directory, 'constructed'))
  assert.ok(called instanceof Writable)
  assert.ok(called instanceof createWriteStreamAtomic)
  assert.ok(constructed instanceof createWriteStreamAtomic.WriteStreamAtomic)

  const calledOutcome = outcome(called)
  const constructedOutcome = outcome(constructed)
  called.end('called')
  constructed.end('constructed')
  assert.deepEqual((await calledOutcome).events.slice(-2), ['finish', 'close'])
  assert.deepEqual((await constructedOutcome).events.slice(-2), ['finish', 'close'])
})

test('finish and close observe a complete renamed file', async (t) => {
  const directory = makeDirectory('stackline-fswsa-events-')
  const target = path.join(directory, 'target.txt')
  t.after(() => removeDirectory(directory))

  const stream = createWriteStreamAtomic(target)
  const observations = []
  stream.on('finish', () => observations.push(['finish', fs.readFileSync(target, 'utf8')]))
  stream.on('close', () => observations.push(['close', fs.readFileSync(target, 'utf8')]))
  const completed = outcome(stream)
  stream.write('first\n')
  stream.end('second\n')

  const result = await completed
  assert.equal(result.error, null)
  assert.deepEqual(result.events, ['open', 'finish', 'close'])
  assert.deepEqual(observations, [
    ['finish', 'first\nsecond\n'],
    ['close', 'first\nsecond\n']
  ])
  assert.deepEqual(adjacentTemporaryFiles(target), [])
})

test('concurrent streams publish one complete winner without interleaving', async (t) => {
  const directory = makeDirectory('stackline-fswsa-concurrent-')
  const target = path.join(directory, 'target.txt')
  t.after(() => removeDirectory(directory))

  const streams = Array.from({ length: 10 }, (_, index) => {
    const stream = createWriteStreamAtomic(target)
    const completed = outcome(stream)
    stream.write(`first ${index}\n`)
    stream.write(`second ${index}\n`)
    stream.end(`third ${index}\n`)
    return completed
  })

  const results = await Promise.all(streams)
  assert.ok(results.every((result) => result.error === null))
  const lines = fs.readFileSync(target, 'utf8').trim().split('\n')
  const winner = lines[0].split(' ')[1]
  assert.deepEqual(lines, [`first ${winner}`, `second ${winner}`, `third ${winner}`])
  assert.deepEqual(adjacentTemporaryFiles(target), [])
})

test('mode and chown options are applied before publication', { skip: process.platform === 'win32' }, async (t) => {
  const directory = makeDirectory('stackline-fswsa-metadata-')
  const target = path.join(directory, 'executable')
  t.after(() => removeDirectory(directory))

  const stream = createWriteStreamAtomic(target, {
    chown: { gid: process.getgid(), uid: process.getuid() },
    mode: 0o755
  })
  const completed = outcome(stream)
  stream.end('#!/bin/sh\n')
  const result = await completed

  assert.equal(result.error, null)
  assert.equal(fs.statSync(target).mode & 0o777, 0o755 & ~process.umask())
})
