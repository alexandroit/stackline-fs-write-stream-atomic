'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')

function makeDirectory(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

function removeDirectory(directory) {
  fs.rmSync(directory, { force: true, recursive: true })
}

function outcome(stream) {
  return new Promise((resolve) => {
    const events = []
    let error = null
    stream.on('open', () => events.push('open'))
    stream.on('error', (value) => {
      error = value
      events.push('error')
    })
    stream.on('finish', () => events.push('finish'))
    stream.on('close', () => {
      events.push('close')
      resolve({ error, events })
    })
  })
}

function adjacentTemporaryFiles(target) {
  const directory = path.dirname(target)
  const prefix = `${path.basename(target)}.`
  return fs.readdirSync(directory)
    .filter((entry) => entry.startsWith(prefix))
    .map((entry) => path.join(directory, entry))
}

module.exports = { adjacentTemporaryFiles, makeDirectory, outcome, removeDirectory }
