# Contributing

Use Node.js 20 or newer for development while keeping production code
executable on exact Node.js 14.15.1.

1. Install the exact graph with `npm ci`.
2. Add a differential, lifecycle, error, concurrency, platform, type, or packed
   consumer test for every observable change.
3. Run `npm run verify`.
4. Review `npm pack --dry-run` and keep fixtures, caches, credentials, and
   development-only evidence out of the artifact.

Preserve callable/newable CommonJS, string paths, Writable callbacks and
backpressure, mode/chown, adjacent rename, append-as-replacement
characterization, complete-winner concurrency, and finish-before-close timing.
Changes to cleanup or Windows EPERM behavior require both success and failure
tests.

Do not add a runtime dependency without a dated maintenance, security,
compatibility, and license review. Do not add browser or crash-durability
claims without an implementation and cross-platform gate.
