# Changelog

## 1.0.1 - 2026-08-30

- Replace the stale direct `graceful-fs@4.2.11` edge with the exact
  `graceful-fs@npm:@stackline/graceful-fs@1.0.0` compatibility alias.
- Preserve the historical internal import key while using the maintained,
  dependency-free Stackline provider.
- Add separate direct scoped and historical-key closure gates covering npm
  warnings, complete trees, production audits, installed identity, runtime
  loading, license inventory and the CycloneDX edge.

## 1.0.0 - 2026-08-28

- Preserve the callable/newable CommonJS Writable contract of
  `fs-write-stream-atomic@1.0.10`.
- Preserve adjacent replacement, chown/mode/options, complete-winner
  concurrency, and successful finish/close timing.
- Add exclusive randomized temporary names with worker-thread identity.
- Clean temporary files on explicit destroy and forwarded stream errors.
- Retain Windows rename EPERM same-content handling.
- Add ESM, first-party TypeScript declarations, packed alias consumers, and a
  current cross-platform verification matrix.
- Reduce the production graph to exact `graceful-fs@4.2.11`.
