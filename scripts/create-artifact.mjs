import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  chmod,
  copyFile,
  mkdtemp,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile
} from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

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

async function createProductionSbom(metadata, archive, temporary) {
  const consumer = path.join(temporary, 'sbom-consumer')
  await mkdir(consumer)
  await writeFile(path.join(consumer, 'package.json'), JSON.stringify({
    name: 'stackline-fs-write-stream-atomic-sbom-consumer',
    version: '0.0.0',
    private: true,
    dependencies: {
      [metadata.name]: pathToFileURL(archive).href
    }
  }, null, 2) + '\n')

  run(npm, [
    'install',
    '--ignore-scripts',
    '--omit=dev',
    '--no-audit',
    '--no-fund'
  ], { cwd: consumer })

  const installedPackage = JSON.parse(await readFile(path.join(
    consumer,
    'node_modules',
    ...metadata.name.split('/'),
    'package.json'
  ), 'utf8'))
  const installedGracefulFs = JSON.parse(await readFile(path.join(
    consumer,
    'node_modules',
    'graceful-fs',
    'package.json'
  ), 'utf8'))
  assert.deepEqual(installedPackage.dependencies, {
    'graceful-fs': 'npm:@stackline/graceful-fs@1.0.0'
  })
  assert.equal(installedGracefulFs.name, '@stackline/graceful-fs')
  assert.equal(installedGracefulFs.version, '1.0.0')
  assert.equal(installedGracefulFs.license, 'ISC')

  const productionTree = JSON.parse(run(npm, [
    'ls',
    '--omit=dev',
    '--all',
    '--json'
  ], { cwd: consumer }))
  assert.equal(productionTree.problems, undefined)

  const consumerSbom = JSON.parse(run(npm, [
    'sbom',
    '--omit=dev',
    '--sbom-format=cyclonedx'
  ], { cwd: consumer }))
  const targetRef = `${metadata.name}@${metadata.version}`
  const targetComponent = consumerSbom.components.find((component) => component['bom-ref'] === targetRef)
  // npm 10 reports an alias under its dependency key, while npm 11 reports
  // the published name. CycloneDX bom-ref preserves the canonical identity.
  const gracefulFsComponent = consumerSbom.components.find((component) =>
    component['bom-ref'] === '@stackline/graceful-fs@1.0.0')
  assert.ok(targetComponent, `SBOM must contain ${targetRef}`)
  assert.ok(gracefulFsComponent, 'SBOM must contain @stackline/graceful-fs@1.0.0')

  const dependencyByRef = new Map(consumerSbom.dependencies.map((entry) => [entry.ref, entry]))
  const targetEdge = dependencyByRef.get(targetRef)
  assert.ok(targetEdge, `SBOM must contain a dependency edge for ${targetRef}`)
  assert.ok(
    targetEdge.dependsOn.includes(gracefulFsComponent['bom-ref']),
    `${targetRef} must depend on ${gracefulFsComponent['bom-ref']}`
  )

  const reachable = new Set()
  const visit = (reference) => {
    if (reachable.has(reference)) return
    reachable.add(reference)
    const edge = dependencyByRef.get(reference)
    if (edge) edge.dependsOn.forEach(visit)
  }
  visit(targetRef)

  return {
    ...consumerSbom,
    metadata: { ...consumerSbom.metadata, component: targetComponent },
    components: consumerSbom.components.filter((component) => (
      component['bom-ref'] !== targetRef && reachable.has(component['bom-ref'])
    )),
    dependencies: consumerSbom.dependencies.filter((entry) => reachable.has(entry.ref))
  }
}

run(npm, ['run', 'verify'], { stdio: 'inherit' })
// Stage beside the destination so the final rename cannot cross filesystems.
const temporary = await mkdtemp(path.join(root, '.artifact-stage-'))
const stage = path.join(temporary, 'release-candidate')
const source = path.join(temporary, 'source')
await mkdir(stage)
await mkdir(source)

try {
  // npm preserves file modes in the tar stream. Build from committed files
  // with normalized modes so restrictive local umasks match clean CI clones.
  const trackedFiles = run('git', ['ls-files', '-z']).split('\0').filter(Boolean)
  for (const file of trackedFiles) {
    const target = path.join(source, file)
    await mkdir(path.dirname(target), { recursive: true })
    await copyFile(path.join(root, file), target)
    await chmod(target, 0o644)
  }

  const output = run(npm, [
    'pack', '--silent', '--json', '--ignore-scripts', '--pack-destination', stage
  ], { cwd: source }).trim()
  const start = output.lastIndexOf('\n[')
  const packed = JSON.parse(start === -1 ? output : output.slice(start + 1))
  assert.equal(packed.length, 1)
  const record = packed[0]
  assert.ok(record.files.every(({ mode }) => mode === 0o644),
    'every shipped regular file must have mode 0644')
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
    productionDependencies: [{ license: 'ISC', name: '@stackline/graceful-fs', version: '1.0.0' }]
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
  const sbom = await createProductionSbom(metadata, archive, temporary)
  await writeFile(path.join(stage, 'sbom.cdx.json'), JSON.stringify(sbom, null, 2) + '\n')

  await rm(destination, { force: true, recursive: true })
  await rename(stage, destination)
  console.log(`Prepared unpublished local artifact ${record.filename} (${bytes.length} bytes).`)
} finally {
  await rm(temporary, { force: true, recursive: true })
}
