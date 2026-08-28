'use strict'

const fs = require('fs')
const createWriteStreamAtomic = require('..')

const target = process.argv[2]
if (!target) throw new Error('Usage: node examples/commonjs.cjs TARGET')

const output = createWriteStreamAtomic(target, { mode: 0o600 })
output.on('error', (error) => { throw error })
output.on('close', () => console.log(fs.readFileSync(target, 'utf8')))
output.end('written atomically with CommonJS')
