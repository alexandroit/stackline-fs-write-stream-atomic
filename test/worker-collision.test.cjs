'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const { isMainThread, parentPort, threadId, Worker, workerData } = require('node:worker_threads')
const { adjacentTemporaryFiles, makeDirectory, removeDirectory } = require('./helpers.cjs')

if (!isMainThread) {
  const createWriteStreamAtomic = require(workerData.modulePath)
  const stream = createWriteStreamAtomic(workerData.target)
  parentPort.postMessage({ temporary: stream.__atomicTmp, threadId })
  stream.on('error', (error) => { throw error })
  stream.on('close', () => parentPort.postMessage({ complete: true }))
  stream.end(`${workerData.marker}:` + workerData.marker.repeat(4096))
} else {
  test('worker threads use distinct adjacent temporary files', async (t) => {
    const directory = makeDirectory('stackline-fswsa-workers-')
    const target = path.join(directory, 'target')
    const modulePath = path.resolve(__dirname, '../index.js')
    t.after(() => removeDirectory(directory))

    const reports = await Promise.all(Array.from({ length: 8 }, (_, index) => new Promise((resolve, reject) => {
      const messages = []
      const worker = new Worker(__filename, {
        workerData: { marker: String(index), modulePath, target }
      })
      worker.on('message', (message) => messages.push(message))
      worker.on('error', reject)
      worker.on('exit', (code) => code === 0 ? resolve(messages) : reject(new Error(`worker exited ${code}`)))
    })))

    const opened = reports.map((messages) => messages.find((message) => message.temporary))
    const temporaryNames = opened.map((message) => message.temporary)
    assert.equal(new Set(temporaryNames).size, temporaryNames.length)
    for (const report of opened) {
      assert.ok(report.temporary.includes(`-${report.threadId}-`))
      assert.equal(path.dirname(report.temporary), directory)
    }
    const actual = fs.readFileSync(target, 'utf8')
    const marker = actual.slice(0, 1)
    assert.equal(actual, `${marker}:` + marker.repeat(4096))
    assert.deepEqual(adjacentTemporaryFiles(target), [])
  })
}
