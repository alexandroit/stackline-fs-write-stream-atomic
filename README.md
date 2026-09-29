# @stackline/fs-write-stream-atomic

> Compatibility-first atomic filesystem Writable streams with maintained lifecycle handling and first-party types.

[![npm version](https://img.shields.io/npm/v/@stackline/fs-write-stream-atomic.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/fs-write-stream-atomic)
[![license](https://img.shields.io/npm/l/@stackline/fs-write-stream-atomic.svg?style=flat-square)](https://github.com/alexandroit/stackline-fs-write-stream-atomic)
[![GitHub repository](https://img.shields.io/badge/GitHub-alexandroit%2Fstackline-fs-write-stream-atomic-181717?style=flat-square&logo=github)](https://github.com/alexandroit/stackline-fs-write-stream-atomic)
[![Docs](https://img.shields.io/badge/docs-alexandro.net-0f766e?style=flat-square)](https://alexandro.net/docs/vanilla/fs-write-stream-atomic/)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation](https://alexandro.net/docs/vanilla/fs-write-stream-atomic/)** | **[npm](https://www.npmjs.com/package/@stackline/fs-write-stream-atomic)** | **[Issues](https://github.com/alexandroit/stackline-fs-write-stream-atomic/issues)** | **[Repository](https://github.com/alexandroit/stackline-fs-write-stream-atomic)**

**Current package version:** `1.0.3`

---

## Why this package?

A compatibility-first maintained continuation of
`fs-write-stream-atomic@1.0.10`. It exposes a Node.js Writable stream that
writes to an adjacent temporary file and replaces the target only after the
temporary stream has closed successfully.

## Compatibility

| Item | Value |
| --- | --- |
| Package | `@stackline/fs-write-stream-atomic@1.0.3` |
| Node.js runtime | `>=14.15.1` |
| CommonJS / primary entry | `./index.js` |
| ES module entry | `./index.mjs` |
| Type declarations | `./index.d.ts` |

## Installation

```sh
npm install @stackline/fs-write-stream-atomic
```

## Usage

```sh
npm install @stackline/fs-write-stream-atomic
```

Existing dependency keys can migrate with an npm alias:

```sh
npm install fs-write-stream-atomic@npm:@stackline/fs-write-stream-atomic
```

<a id="commonjs"></a>

### CommonJS

```js
const createWriteStreamAtomic = require('@stackline/fs-write-stream-atomic')

const output = createWriteStreamAtomic('output.txt', { mode: 0o600 })
output.on('error', console.error)
output.on('close', () => console.log('replacement visible'))
output.end('complete value')
```

The factory remains callable with or without `new`.

<a id="esm"></a>

### ESM

```js
import createWriteStreamAtomic, { WriteStreamAtomic } from '@stackline/fs-write-stream-atomic'

const output = new WriteStreamAtomic('output.txt')
output.end('complete value')
```

## Features and Integrations

<a id="error-and-cancellation-cleanup"></a>

### Error and cancellation cleanup

Use `stream.pipeline()` when connecting a source so a source error destroys the
destination and removes its temporary file:

```js
const { pipeline } = require('stream')
pipeline(input, createWriteStreamAtomic('output.txt'), callback)
```

Bare `.pipe()` does not forward source errors. Call `destination.destroy(error)`
yourself if the source is managed separately. Explicit destroy and ordinary
write/chown/rename failures are cleaned up. Abrupt process termination can
still leave a temporary file.

## Security

<a id="atomicity-boundary"></a>

### Atomicity boundary

The adjacent rename supplies atomic visibility on filesystems that provide it.
This package does not fsync the file or parent directory and does not claim
power-loss durability. It is not a transaction across multiple files.

See [COMPATIBILITY_CONTRACT.md](https://github.com/alexandroit/stackline-fs-write-stream-atomic/blob/main/COMPATIBILITY_CONTRACT.md) and
[MIGRATION.md](https://github.com/alexandroit/stackline-fs-write-stream-atomic/blob/main/MIGRATION.md) before replacing the historical package.

## API Surface

<a id="options-and-events"></a>

### Options and events

The documented filename is a string. Writable and file-stream options such as
`encoding`, `mode`, `flags`, and `highWaterMark` are supported. An additional
`chown: { uid, gid }` option applies ownership before rename.

`open` reflects the temporary file descriptor. On success, `finish` occurs
only after the physical file closes and rename succeeds; `close` follows it.
The existing target remains visible until then. Contending writers publish one
complete winner.

Append flags preserve upstream behavior: because every operation starts with
a new temporary file, `flags: 'a'` replaces the target with newly streamed
content rather than appending to its old content.

## Local Development

```sh
git clone https://github.com/alexandroit/stackline-fs-write-stream-atomic.git
cd stackline-fs-write-stream-atomic
npm ci
npm run verify
```

Release tooling uses Node.js 24.20.0 and npm 11.19.0. The consumer runtime contract remains the one documented above.

## Consumer Smoke Test

Run the repository's existing consumer/package check after installing development dependencies:

```sh
npm run test:smoke
```

## Release Checklist

Run `npm run verify` and inspect the package contents before release. Publish a new version through the [GitHub Actions publishing workflow](https://github.com/alexandroit/stackline-fs-write-stream-atomic/actions/workflows/publish.yml), using the SHA-512 digest of the reviewed tarball. Verify the exact published version, tarball integrity, and npm provenance after the run.

## License

ISC. See [the license](https://github.com/alexandroit/stackline-fs-write-stream-atomic/blob/main/LICENSE) for the complete terms.

Original authorship and third-party attribution are preserved in [NOTICE](https://github.com/alexandroit/stackline-fs-write-stream-atomic/blob/main/NOTICE).

## Credits and original authors

- Stackline Maintainers.
- Copyright (c) 2026 Stackline Maintainers.
- Stackline maintenance: [Alexandro Paixao Marques](https://www.linkedin.com/in/aleinfo/) and [Stackline contributors](https://github.com/alexandroit).

Original copyright, license notices and contributor acknowledgements remain part of this distribution. Stackline maintenance does not replace authorship of the original work.

## Community and Links

- [Stackline website](https://alexandro.net/)
- [GitHub projects](https://github.com/alexandroit)
- [npm packages](https://www.npmjs.com/~alex360qc)
- [Reddit community — r/Stackline](https://www.reddit.com/r/Stackline/)
- [Maintainer LinkedIn](https://www.linkedin.com/in/aleinfo/)

Use this repository's issue tracker for reproducible bugs and feature requests. Join r/Stackline for examples, usage questions and release discussions.
