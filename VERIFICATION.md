# Verification

Observed 2026-08-28 in the local package workspace.

## Required gates

- Immutable upstream 1.0.10 differential behavior.
- Callable/newable CJS, ESM, TypeScript 3.9/current, and package exports.
- Writable callbacks/backpressure, target visibility, mode/chown, append
  characterization, complete-winner concurrency, and finish/close timing.
- Explicit destroy, pipeline error, rename/chown failure, Windows EPERM, and
  temporary cleanup.
- Process and worker-thread temporary-name collision resistance.
- Packed scoped and historical-key alias consumers.
- Coverage, lint, publint, Are the Types Wrong, licenses, production/full
  audit, signatures, and dry-run inventory.
- CI design for exact Node 14.15.1, maintained Node releases, Windows, and
  macOS.

## 2026-08-28 local gate

`npm run verify` completed successfully at 2026-08-28T16:30:53Z:

- 4 upstream-style subtests and one differential suite covering default,
  encoding/high-water-mark, mode, and append behavior passed against the exact
  1.0.10 development alias.
- 12 lifecycle/error/EPERM subtests passed: visibility before rename,
  backpressure and callbacks, append characterization, delayed physical close,
  explicit destroy, pipeline-forwarded source failure, rename/chown/open
  failures, and matching/different/missing-target Windows EPERM cases.
- Two stress subtests passed: 24 contending large streams produced one complete
  winner, and eight worker threads used distinct adjacent temporary names.
- ESM default/named identity and TypeScript 3.9/current declarations passed.
- Runtime probes passed on exact Node.js 14.15.1, 16.20.2, 18.20.8, 20.20.2,
  22.22.0, and 24.7.0.
- The 17-subtest coverage gate measured 94.17% statements/lines, 82.02%
  branches, and 100% functions.
- Clean packed scoped and historical-key consumers passed for CommonJS, ESM,
  extensionless `index`, `index.js`, mode, lifecycle, and the exact production
  tree.
- `publint` reported all good. Are the Types Wrong reported no problems for
  root, `index`, `index.js`, and `package.json` under Node 10/16 and bundler
  resolution profiles.
- The dry-run inventory contains 16 files, approximately 8.6 kB packed and
  26.1 kB unpacked. The production license gate contains only exact
  `graceful-fs@4.2.11` under the ISC root.
- Production and full npm audits found zero known vulnerabilities. All 183
  installed registry packages had verified signatures; 24 had attestations.

This is source/package verification only. Cross-platform workflow definitions
are checked in, but remote Linux/macOS/Windows CI and CodeQL have not run. No
immutable tarball, checksum set, SBOM, registry publication, repository,
release, production documentation, or public contact was created.
