import { rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
await Promise.all([
  rm(new URL('../coverage/', import.meta.url), { force: true, recursive: true }),
  rm(new URL('../release-candidate/', import.meta.url), { force: true, recursive: true })
])

console.log(`Cleaned generated output under ${root}`)
