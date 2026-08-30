# Verification

Observed through 2026-08-30 in the local package workspace.

## 1.0.1 dependency remediation

- The manifest preserves the `graceful-fs` runtime key through the exact
  `npm:@stackline/graceful-fs@1.0.0` alias.
- Separate fresh direct scoped and historical-key parent consumers now gate
  npm warning output, the complete production tree, production audit, runtime
  loading, lockfile shape and exact child identity.
- License and CycloneDX gates require the maintained child and preserved ISC
  attribution.
- Final local, hosted, Verdaccio and official-registry evidence remains pending
  until the child package has propagated through the official registry.

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

## Retained 1.0.0 local gate

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
- The 1.0.0 dry-run inventory contains 16 files, approximately 8.6 kB packed
  and 26.1 kB unpacked. Its production license gate contained only exact
  `graceful-fs@4.2.11` under the ISC root; that edge is not accepted for 1.0.1.
- Production and full npm audits found zero known vulnerabilities. All 183
  installed registry packages had verified signatures; 24 had attestations.

This local result was the source/package gate. The later sections record the
completed remote, artifact, registry, and release gates independently.

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
- None of these red runs authorized an artifact or publication. Final source
  commit `8a24db30a73feba4540186a5034a44ea81d3cf62` subsequently passed main CI
  run 33191259807 and CodeQL run 33191259803.

## Artifact staging correction

CI run 33191041322 and CodeQL run 33191041321 passed on source commit
`a5996d9e2d5b9a82e9a13d6d49686759419a63e6`, with all ten CI jobs successful.
The first `artifact:prepare` invocation then completed every verification and
created a disposable staged pack, but its final rename from `/tmp` crossed a
filesystem boundary and failed with `EXDEV`. The `finally` cleanup removed the
stage; no `release-candidate`, accepted tarball, checksum set, or SBOM survived,
and nothing was published. Artifact staging now occurs beside the destination
so its final promotion is same-filesystem. The correction is included in final
source commit `8a24db30a73feba4540186a5034a44ea81d3cf62`; main CI run
33191259807 and CodeQL run 33191259803 passed before the accepted artifact was
selected.

## Published release verification

- The accepted 16-file, 8,654-byte tarball was selected from main CI run
  33191259807 at 2026-08-28T16:46:30Z. Its SHA-1 is
  `77a0ebaac6c862f4e337f18410faf51cae7fe630`, SHA-256 is
  `a6d985cb143cba8bbae9da7d72ce258e9fb6c4e92a41d70005ace7502b533fd3`,
  and npm integrity is
  `sha512-8i1isxdsAzUBIW+vGB33+y0arRUZaVC7zFr+xH48KM/45xjF/UeOPjRottnrUIv+45TCpCkrOBOVqGFKEh1dQg==`.
- Verdaccio accepted those exact bytes. Fresh scoped and historical-key alias
  consumers passed.
- Official npm created `@stackline/fs-write-stream-atomic@1.0.0` at
  2026-08-28T16:50:00.660Z. A transient E404 affected the full packument after
  the successful publish; no republish was attempted. Full public metadata had
  propagated by 2026-08-28T16:54:55Z. The fetched tarball was byte-identical,
  and clean unauthenticated scoped, historical-key alias, CommonJS, ESM, and
  deep-entry consumers passed.
- Source/tag commit `8a24db30a73feba4540186a5034a44ea81d3cf62`
  passed main CI 33191259807, main CodeQL 33191259803, tag CI 33192270974,
  and tag CodeQL 33192270992.

### GitHub release immutability preflight

The first release attempt exposed a repository-setting precondition rather
than an asset failure. [`stackline-v1.0.0`](https://github.com/alexandroit/stackline-fs-write-stream-atomic/releases/tag/stackline-v1.0.0)
was published while release immutability was disabled. That release remains
untouched and mutable; it was not deleted, moved, or recreated. The repository
setting was enabled immediately afterward.

The canonical `v1.0.0` release was then created as a draft, populated with the
exact ten assets, and published immutable at 2026-08-28T16:59:08Z:
<https://github.com/alexandroit/stackline-fs-write-stream-atomic/releases/tag/v1.0.0>.
The GitHub API reports `immutable: true` and the expected asset digests. The
downloaded release tarball matches the accepted SHA-256. This installed `gh`
CLI lacks an attestation command, so no CLI attestation claim is made; API
immutability/digest evidence and the independently downloaded tarball provide
the recorded verification.

### Future SBOM generation

The accepted release-candidate SBOM retains the required root dependency edge
to `graceful-fs@4.2.11`. npm 10.8.2 had omitted that sole runtime edge when
`npm sbom --omit=dev` ran in the development tree. For future versions,
`scripts/create-artifact.mjs` now installs the packed tarball into a disposable
production-only consumer, validates the installed manifest, exact
`graceful-fs@4.2.11` version and ISC license, clean `npm ls --omit=dev` tree,
and CycloneDX root edge, then emits only the target's reachable production
closure. This post-release tooling correction does not modify any current
release-candidate or published bytes.

## Adoption lane verification

- Pull request <https://github.com/Kampfkarren/selene/pull/686> is based on
  `9d531b8d3755e139b26c534914e252239014bb3d` with head
  `a94cbb8f0e3d837f704fa2100c7d66062a453d19`. Its changed tree contains only
  `selene-vscode/package.json` and `selene-vscode/package-lock.json`.
- Clean baseline and changed-tree installs, compile, ESLint, Prettier, exact
  alias resolution, CommonJS root/deep-entry loading, and atomic
  commit/temporary cleanup all passed. The audit count was unchanged at 23.
- Four PR workflow runs report `action_required` with no jobs instantiated
  pending maintainer approval. This is an external execution-approval state,
  not a changed-tree failure.
- Different-repository issue
  <https://github.com/vladimiry/ElectronMail/issues/782> is based on
  `a7a2c71548ef71cf2060a3b4114be62ea4be8d4d`. It records the exact
  `fs-write-stream-atomic@1.0.10` development dependency in `package.json` and
  the constructor use in
  `src/electron-main/database/serialization/util.ts`. The focused Node.js 24
  and TypeScript 6 constructor/options/lifecycle shape passed.
- The issue is open with zero comments, includes independent-maintainer
  disclosure and neutral choices, and makes no security claim.
- Different-repository check: **PASS**. Adoption coverage: **COMPLETE**. No
  unsolicited follow-up is authorized.
- Closing live observation `2026-08-28T17:18:32Z`: both contacts remained
  open with no maintainer response; live repository/global deduplication
  returned only the recorded PR and issue.

The production documentation URL is
<https://alexandro.net/docs/vanilla/fs-write-stream-atomic/>. Initial source
commit `a43939b2b703085c715af247d3ea86239c72d80a` and final deployed commit
`1725afaa59e5c8f207ce13bb43e259a4bf9e05ab` passed CI run `33193330044` and
CodeQL run `33193328687`. Production matched the final root and compatibility
trees at 132/132 files and the package tree at 18/18 files. All 12 package
sitemap routes and all 18 canonical package files passed origin and
Cloudflare checks with the expected MIME types. Edge verification found
Cloudflare incorrectly obfuscating the literal `graceful-fs@4.2.11`; the final
commit added a minimal guard, and the normalized edge output now matches the
origin with no `__cf_email__`, `data-cfemail`, decoder script, or protection
URL.

## Canonical record

Canonical Drive release verification: `1Iatk4L5mHh8zCqZDYSxMth1ZlOkVBBIR`,
<https://drive.google.com/file/d/1Iatk4L5mHh8zCqZDYSxMth1ZlOkVBBIR/view>.
