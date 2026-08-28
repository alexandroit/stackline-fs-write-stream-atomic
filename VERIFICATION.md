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

`npm run verify` completed successfully at 2026-08-28T16:37:38Z:

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
- The 17-subtest coverage gate measured 92.90% statements/lines, 80.45%
  branches, and 100% functions.
- Clean packed scoped and historical-key consumers passed for CommonJS, ESM,
  extensionless `index`, `index.js`, shipped CommonJS/ESM examples, mode,
  lifecycle, and the exact production tree.
- `publint` reported all good. Are the Types Wrong reported no problems for
  root, `index`, `index.js`, and `package.json` under Node 10/16 and bundler
  resolution profiles.
- The dry-run inventory contains 16 files, approximately 8.6 kB packed and
  26.1 kB unpacked. The production license gate contains only exact
  `graceful-fs@4.2.11` under the ISC root.
- Production and full npm audits found zero known vulnerabilities. All 183
  installed registry packages had verified signatures; 24 had attestations.

This is source/package verification only. Cross-platform workflows have run,
but the corrected commit still requires a complete green replacement matrix.
No immutable tarball, checksum set, SBOM, registry publication, release,
production documentation, or public contact was created.

## Pre-publication remote corrections

- Initial CI run 33190522361 exposed an over-strict Windows concurrency test:
  upstream-compatible losing rename operations may report `EPERM` when their
  bytes differ from the winning writer. The assertion now requires one whole
  winner and accepts only that characterized Windows rename error.
- Replacement CI run 33190637929 then exposed a real missing-target cleanup
  race: a parallel hash stream still held the temporary file when Windows
  attempted unlink. Hash comparison is now sequential and waits for each file
  descriptor to close before cleanup. The same run showed that a relative ESM
  directory import in the shipped example did not execute from the installed
  tarball; both examples now use the package self-reference, and the packed
  smoke gate executes them directly.
- Corrected CI run 33190920799 passed the full Windows contract, including the
  cleanup regression, and its large-writer stress case. Its separate worker
  collision harness still treated an upstream-compatible losing Windows
  rename `EPERM` as an uncaught worker failure. The harness now records those
  characterized losers while requiring unique adjacent names, successful
  worker closure, at least one publisher, one whole final value, and no
  temporary-file leak.
- None of these red runs authorized an artifact or publication. A fresh full CI and
  CodeQL pair on the corrected commit remains required.
