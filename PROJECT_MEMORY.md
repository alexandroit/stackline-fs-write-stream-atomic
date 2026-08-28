---
schema: stackline-project-memory-v1
package: fs-write-stream-atomic
target: "@stackline/fs-write-stream-atomic"
version: 1.0.0
state: BUILDING
updated: 2026-08-28
---

# Project Memory

## Frozen decision

The dated GO-to-build decision is frozen in [UPSTREAM_AUDIT.md](./UPSTREAM_AUDIT.md).
The baseline is the immutable `fs-write-stream-atomic@1.0.10` tarball. Queue
selection was rank 1 `CODEX_READY`; no user pin exists.

## Compatibility boundary

Preserve the callable/newable CommonJS Writable, documented string path,
encoding/mode/flags/highWaterMark/chown options, adjacent complete-winner
rename, Windows EPERM comparison, and successful `open -> finish -> close`
timing. Append flags remain replacement semantics. Add ESM/types without a
browser or crash-durability claim.

## Current state

The complete local source/package gate passed at 2026-08-28T16:30:53Z. It
covers the immutable 1.0.10 differential, 19 Node test subtests, slow-close and
destroy/error cleanup, worker contention, CJS/ESM, TypeScript 3.9/current,
packed scoped and historical-key consumers, exact Node.js 14.15.1 through
24.7.0, package quality, licenses, audits, and signatures. Coverage is 94.17%
statements/lines, 82.02% branches, and 100% functions.

State remains `BUILDING`. Remote CI and CodeQL have not run, and the immutable
artifact is intentionally not built: it must be produced once from the exact
remote-green commit. Nothing has been published to Verdaccio or npm, no GitHub
project/release has been created, no production documentation has been changed,
and no public contact has been made. Do not advance state without the remaining
authorized remote gates.
