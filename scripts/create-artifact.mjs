import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const destination = path.join(root, 'release-candidate')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function run(command, arguments_, options = {}) {
  return execFileSync(command, arguments_, {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, NO_UPDATE_NOTIFIER: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options
  })
}

run(npm, ['run', 'verify'], { stdio: 'inherit' })
// Stage beside the destination so the final rename cannot cross filesystems.
const temporary = await mkdtemp(path.join(root, '.artifact-stage-'))
const stage = path.join(temporary, 'release-candidate')
await mkdir(stage)

try {
  const output = run(npm, ['pack', '--silent', '--json', '--ignore-scripts', '--pack-destination', stage]).trim()
  const start = output.lastIndexOf('\n[')
  const packed = JSON.parse(start === -1 ? output : output.slice(start + 1))
  assert.equal(packed.length, 1)
  const record = packed[0]
  const archive = path.join(stage, record.filename)
  const bytes = await readFile(archive)
  const digests = Object.fromEntries(['sha1', 'sha256', 'sha512'].map((algorithm) => [
    algorithm,
    crypto.createHash(algorithm).update(bytes).digest('hex')
  ]))
  const inventory = record.files.map((file) => ({ path: file.path, size: file.size })).sort((a, b) => a.path.localeCompare(b.path))
  const metadata = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
  const manifest = {
    schema: 'stackline-release-artifact-v1',
    package: `${metadata.name}@${metadata.version}`,
    archive: record.filename,
    bytes: bytes.length,
    fileCount: inventory.length,
    digests
  }

  await writeFile(path.join(stage, 'artifact-manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  await writeFile(path.join(stage, 'inventory.json'), JSON.stringify(inventory, null, 2) + '\n')
  await writeFile(path.join(stage, 'licenses.json'), JSON.stringify({
    package: { license: 'ISC', name: metadata.name, version: metadata.version },
    productionDependencies: [{ license: 'ISC', name: 'graceful-fs', version: '4.2.11' }]
  }, null, 2) + '\n')
  await writeFile(path.join(stage, 'RELEASE_NOTES.md'), [
    `# ${metadata.name} ${metadata.version}`,
    '',
    'Compatibility-first atomic Writable streams based on the immutable fs-write-stream-atomic 1.0.10 contract.',
    '',
    'See CHANGELOG.md for the release summary and VERIFICATION.md plus artifact-manifest.json for the tested contract and exact artifact evidence.',
    ''
  ].join('\n'))
  await writeFile(path.join(stage, 'SHA1SUMS'), `${digests.sha1}  ${record.filename}\n`)
  await writeFile(path.join(stage, 'SHA256SUMS'), `${digests.sha256}  ${record.filename}\n`)
  await writeFile(path.join(stage, 'SHA512SUMS'), `${digests.sha512}  ${record.filename}\n`)
  const sbom = run(npm, ['sbom', '--omit=dev', '--sbom-format=cyclonedx'])
  JSON.parse(sbom)
  await writeFile(path.join(stage, 'sbom.cdx.json'), sbom.endsWith('\n') ? sbom : `${sbom}\n`)

  await rm(destination, { force: true, recursive: true })
  await rename(stage, destination)
  console.log(`Prepared unpublished local artifact ${record.filename} (${bytes.length} bytes).`)
} finally {
  await rm(temporary, { force: true, recursive: true })
}
