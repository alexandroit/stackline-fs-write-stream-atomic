import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const temporary = await mkdtemp(path.join(os.tmpdir(), 'stackline-fswsa-smoke-'))
const consumer = path.join(temporary, 'consumer')

function run(command, arguments_, cwd = root, stdio = ['ignore', 'pipe', 'pipe']) {
  return execFileSync(command, arguments_, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NO_UPDATE_NOTIFIER: '1' },
    stdio
  })
}

try {
  await mkdir(consumer)
  const output = run(npm, ['pack', '--silent', '--json', '--ignore-scripts', '--pack-destination', temporary]).trim()
  const start = output.lastIndexOf('\n[')
  const packed = JSON.parse(start === -1 ? output : output.slice(start + 1))
  assert.equal(packed.length, 1)
  const archive = packed[0].filename

  await writeFile(path.join(consumer, 'package.json'), JSON.stringify({
    name: 'fs-write-stream-atomic-packed-consumer',
    private: true,
    type: 'module',
    dependencies: {
      '@stackline/fs-write-stream-atomic': `file:../${archive}`,
      'fs-write-stream-atomic': `file:../${archive}`
    }
  }, null, 2) + '\n')
  run(npm, ['install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund'], consumer)

  await writeFile(path.join(consumer, 'commonjs.cjs'), `
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const scoped = require('@stackline/fs-write-stream-atomic')
const legacy = require('fs-write-stream-atomic')
const scopedIndex = require('@stackline/fs-write-stream-atomic/index')
const legacyIndex = require('fs-write-stream-atomic/index.js')
const target = path.join(__dirname, 'commonjs.txt')
assert.equal(typeof scoped, 'function')
assert.equal(typeof legacy, 'function')
assert.equal(scopedIndex, scoped)
assert.equal(legacyIndex, legacy)
const stream = new legacy(target, { mode: 0o600 })
stream.on('close', () => {
  assert.equal(fs.readFileSync(target, 'utf8'), 'packed CommonJS')
  console.log('packed scoped and legacy-key CommonJS passed')
})
stream.end('packed CommonJS')
`)
  await writeFile(path.join(consumer, 'module.mjs'), `
import assert from 'node:assert/strict'
import fs from 'node:fs'
import createWriteStreamAtomic, { WriteStreamAtomic } from '@stackline/fs-write-stream-atomic'
import deepCreateWriteStreamAtomic from '@stackline/fs-write-stream-atomic/index'
const target = new URL('./module.txt', import.meta.url)
const stream = createWriteStreamAtomic(target.pathname)
assert.ok(stream instanceof WriteStreamAtomic)
assert.equal(deepCreateWriteStreamAtomic, createWriteStreamAtomic)
stream.on('close', () => {
  assert.equal(fs.readFileSync(target, 'utf8'), 'packed ESM')
  console.log('packed ESM passed')
})
stream.end('packed ESM')
`)
  run(process.execPath, ['commonjs.cjs'], consumer, 'inherit')
  run(process.execPath, ['module.mjs'], consumer, 'inherit')

  const installedRoot = path.join(
    consumer, 'node_modules', '@stackline', 'fs-write-stream-atomic'
  )
  run(process.execPath, [
    path.join(installedRoot, 'examples', 'commonjs.cjs'),
    path.join(consumer, 'installed-example-commonjs.txt')
  ], consumer, 'inherit')
  run(process.execPath, [
    path.join(installedRoot, 'examples', 'esm.mjs'),
    path.join(consumer, 'installed-example-esm.txt')
  ], consumer, 'inherit')

  const installed = JSON.parse(await readFile(path.join(
    consumer, 'node_modules', '@stackline', 'fs-write-stream-atomic', 'package.json'
  ), 'utf8'))
  assert.deepEqual(installed.dependencies, {
    'graceful-fs': 'npm:@stackline/graceful-fs@1.0.0'
  })
  const graceful = JSON.parse(await readFile(path.join(
    consumer, 'node_modules', 'graceful-fs', 'package.json'
  ), 'utf8'))
  assert.equal(graceful.name, '@stackline/graceful-fs')
  assert.equal(graceful.version, '1.0.0')
  const tree = JSON.parse(run(npm, ['ls', '--omit=dev', '--all', '--json'], consumer))
  assert.equal(tree.problems, undefined)
  console.log('Packed scoped, legacy-key alias, ESM, and production-tree consumers passed.')
} finally {
  await rm(temporary, { force: true, recursive: true })
}
