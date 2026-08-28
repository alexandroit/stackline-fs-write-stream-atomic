import fs from 'node:fs'
import createWriteStreamAtomic from '..'

const target = process.argv[2]
if (!target) throw new Error('Usage: node examples/esm.mjs TARGET')

const output = createWriteStreamAtomic(target)
output.on('error', (error) => { throw error })
output.on('close', () => console.log(fs.readFileSync(target, 'utf8')))
output.end('written atomically with ESM')
