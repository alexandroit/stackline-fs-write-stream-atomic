# Registry Handoff

- upstream: `fs-write-stream-atomic@1.0.10`
- target: `@stackline/fs-write-stream-atomic@1.0.0`
- decision: GO to local build, frozen 2026-08-28
- state: `BUILDING`; **not published**
- queue selection: rank 1 `CODEX_READY`
- user pin: `NOT_PINNED`
- runtime: Node.js `>=14.15.1`
- preserved: callable/newable CJS Writable, string paths, backpressure,
  chown/mode/options, adjacent rename, complete-winner concurrency,
  append-as-replacement, and finish-before-close timing
- additive: ESM and TypeScript declarations
- production dependency: exact `graceful-fs@4.2.11`

Do not publish or claim registry, GitHub, CI, release, documentation, or
consumer-adoption success until separately authorized and independently
verified.
