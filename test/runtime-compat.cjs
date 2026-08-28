'use strict'

var assert = require('assert')
var fs = require('fs')
var os = require('os')
var path = require('path')
var createWriteStreamAtomic = require('..')

var minimum = [14, 15, 1]
var actual = process.versions.node.split('.').map(Number)
var supported = actual[0] > minimum[0] ||
  actual[0] === minimum[0] && (actual[1] > minimum[1] ||
    actual[1] === minimum[1] && actual[2] >= minimum[2])

assert(supported, 'runtime must satisfy Node >=14.15.1')
assert.strictEqual(typeof createWriteStreamAtomic, 'function')
assert.strictEqual(createWriteStreamAtomic.WriteStreamAtomic, createWriteStreamAtomic)

var directory = fs.mkdtempSync(path.join(os.tmpdir(), 'stackline-fswsa-runtime-'))
var target = path.join(directory, 'target')
var events = []
var stream = new createWriteStreamAtomic(target, { highWaterMark: 2, mode: 0o600 })
stream.on('open', function () { events.push('open') })
stream.on('error', fail)
stream.on('finish', function () { events.push('finish') })
stream.on('close', function () {
  events.push('close')
  try {
    assert.strictEqual(fs.readFileSync(target, 'utf8'), 'runtime compatibility')
    assert.deepStrictEqual(events, ['open', 'finish', 'close'])
    assert.strictEqual(fs.readdirSync(directory).length, 1)
    import('../index.mjs').then(function (module) {
      assert.strictEqual(module.default, createWriteStreamAtomic)
      assert.strictEqual(module.WriteStreamAtomic, createWriteStreamAtomic)
      fs.rmSync(directory, { force: true, recursive: true })
      console.log('Runtime compatibility passed on Node ' + process.versions.node + '.')
    }, fail)
  } catch (error) {
    fail(error)
  }
})
stream.write('runtime ')
stream.end('compatibility')

function fail(error) {
  fs.rmSync(directory, { force: true, recursive: true })
  process.nextTick(function () { throw error })
}
