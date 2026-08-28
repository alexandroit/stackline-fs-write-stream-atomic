# @stackline/fs-write-stream-atomic

A compatibility-first maintained continuation of
`fs-write-stream-atomic@1.0.10`. It exposes a Node.js Writable stream that
writes to an adjacent temporary file and replaces the target only after the
temporary stream has closed successfully.

```sh
npm install @stackline/fs-write-stream-atomic
```

Existing dependency keys can migrate with an npm alias:

```sh
npm install fs-write-stream-atomic@npm:@stackline/fs-write-stream-atomic
```

## CommonJS

```js
const createWriteStreamAtomic = require('@stackline/fs-write-stream-atomic')

const output = createWriteStreamAtomic('output.txt', { mode: 0o600 })
output.on('error', console.error)
output.on('close', () => console.log('replacement visible'))
output.end('complete value')
```

The factory remains callable with or without `new`.

## ESM

```js
import createWriteStreamAtomic, { WriteStreamAtomic } from '@stackline/fs-write-stream-atomic'

const output = new WriteStreamAtomic('output.txt')
output.end('complete value')
```

## Options and events

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

## Error and cancellation cleanup

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

## Atomicity boundary

The adjacent rename supplies atomic visibility on filesystems that provide it.
This package does not fsync the file or parent directory and does not claim
power-loss durability. It is not a transaction across multiple files.

See [COMPATIBILITY_CONTRACT.md](./COMPATIBILITY_CONTRACT.md) and
[MIGRATION.md](./MIGRATION.md) before replacing the historical package.
