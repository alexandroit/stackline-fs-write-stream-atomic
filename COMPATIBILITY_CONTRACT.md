# Compatibility Contract

## Baseline

The immutable baseline is `fs-write-stream-atomic@1.0.10`. The CommonJS root
remains a Writable factory callable with or without `new`; the documented path
input remains a string.

## Preserved behavior

- Bytes are written to an adjacent temporary file and one complete writer
  replaces the target after physical stream close.
- `open` is forwarded. A successful `finish` and later `close` mean rename has
  completed and the target contains all accepted bytes.
- Standard Writable callbacks, backpressure, `drain`, `cork`, `uncork`, and
  destroy behavior remain available.
- `encoding`, `mode`, `flags`, and `highWaterMark` are honored; `chown` is
  applied to the temporary file before rename.
- Concurrent writers produce one whole winning value, never byte interleaving.
- On simulated Windows rename `EPERM`, identical target/temporary hashes count
  as success; different content remains an error.
- As in upstream 1.0.10, `flags: 'a'` writes a fresh temporary file and replaces
  the target. It does not append to the pre-existing target.

## Bounded corrections

- Temporary names include process, worker-thread, invocation, and random
  identity and are opened exclusively.
- Explicit `destroy()`, physical stream errors, rename/chown failures, and
  errors forwarded through `pipeline()` clean up the sibling temporary file.
- The implementation uses core Writable and removes `iferr`, `imurmurhash`,
  and `readable-stream` from the production graph.

These corrections do not add crash durability. No file or directory fsync is
performed. Abrupt process termination can still leave a temporary file because
JavaScript cleanup cannot be guaranteed after termination.

## Additive surfaces

The package adds ESM default/named exports, TypeScript 3.9-compatible
declarations, conditional exports, scoped metadata, and packed-consumer gates.
There is no browser contract.

## Boundaries

Custom temporary directories are intentionally unsupported because they can
cross filesystems and invalidate rename atomicity. Bare `source.pipe(target)`
does not forward source errors; use `pipeline()` or explicitly destroy the
destination. Passing a file descriptor or disabling physical auto-close is not
a supported atomic contract. The package promises atomic visibility after
successful terminal events, not multi-file transactions or power-loss
durability.
