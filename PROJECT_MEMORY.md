---
schema: stackline-project-memory-v1
package: fs-write-stream-atomic
target: "@stackline/fs-write-stream-atomic"
version: 1.0.1
state: BUILDING
updated: 2026-08-30
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

## Active dependency remediation

Version 1.0.1 replaces `graceful-fs@4.2.11` with the exact historical-key
alias `graceful-fs@npm:@stackline/graceful-fs@1.0.0`. The runtime import and
public API remain unchanged. Release requires separate clean direct and alias
consumers with no npm warnings, valid full production trees, zero audit
findings, exact child identity, preserved ISC evidence and SBOM linkage.

## Retained 1.0.0 published state

The complete local source/package gate passed at 2026-08-28T16:37:38Z. It
covers the immutable 1.0.10 differential, 19 Node test subtests, slow-close and
destroy/error cleanup, worker contention, CJS/ESM, TypeScript 3.9/current,
packed scoped and historical-key consumers, exact Node.js 14.15.1 through
24.7.0, package quality, licenses, audits, and signatures. Coverage is 92.90%
statements/lines, 80.45% branches, and 100% functions.

Final source/tag commit `8a24db30a73feba4540186a5034a44ea81d3cf62`
passed main CI 33191259807, main CodeQL 33191259803, tag CI 33192270974,
and tag CodeQL 33192270992. The accepted 8,654-byte artifact has SHA-1
`77a0ebaac6c862f4e337f18410faf51cae7fe630`, SHA-256
`a6d985cb143cba8bbae9da7d72ce258e9fb6c4e92a41d70005ace7502b533fd3`,
and integrity
`sha512-8i1isxdsAzUBIW+vGB33+y0arRUZaVC7zFr+xH48KM/45xjF/UeOPjRottnrUIv+45TCpCkrOBOVqGFKEh1dQg==`.

Verdaccio serves exact bytes and clean scoped/alias consumers passed. Official
npm created the package at 2026-08-28T16:50:00.660Z. A transient full-packument
E404 followed the successful publish; nothing was republished. Full metadata
propagated by 16:54:55Z, after which exact-byte tarball and clean unauthenticated
scoped, alias, CommonJS, ESM, and deep-entry consumers passed.

## Release immutability record

The first [`stackline-v1.0.0`](https://github.com/alexandroit/stackline-fs-write-stream-atomic/releases/tag/stackline-v1.0.0)
GitHub release was published while the repository immutability setting was
false. It remains untouched and mutable. It was not deleted, moved, or
recreated; the setting was enabled immediately. The canonical `v1.0.0` release
was created as a draft with the exact ten assets and published immutable at
2026-08-28T16:59:08Z:
<https://github.com/alexandroit/stackline-fs-write-stream-atomic/releases/tag/v1.0.0>.
The API reports `immutable: true` and exact asset digests, and the downloaded
tarball matches the accepted hash. The installed `gh` CLI has no attestation
command, so the record relies on those API and byte-verification results.

The accepted 1.0.0 SBOM contains the root edge to exact
`graceful-fs@4.2.11`. Version 1.0.1 supersedes that edge. Artifact generation
derives the CycloneDX production closure from an isolated packed consumer and
asserts the replacement identity, version, license and clean production tree.

## Adoption coverage

The focused two-file migration pull request
<https://github.com/Kampfkarren/selene/pull/686> moves the `selene-vscode`
historical package key to the exact Stackline npm alias. Its frozen base is
`9d531b8d3755e139b26c534914e252239014bb3d` and its head is
`a94cbb8f0e3d837f704fa2100c7d66062a453d19`. Clean baseline and changed-tree
installs, compile, ESLint, Prettier, alias resolution, CommonJS deep entries,
and atomic cleanup passed; the audit count remained 23. The repository's four
workflow runs are `action_required` with no jobs pending maintainer approval,
not failed changed-tree checks.

The different-repository maintainer-decision issue
<https://github.com/vladimiry/ElectronMail/issues/782> is based on commit
`a7a2c71548ef71cf2060a3b4114be62ea4be8d4d`. It identifies the exact
`package.json` development dependency and the constructor use in
`src/electron-main/database/serialization/util.ts`; the focused Node.js 24 and
TypeScript 6 shape passed. The open issue has zero comments, discloses
independent Stackline maintainership, offers neutral choices, and makes no
security claim.

The different-repository check passes and adoption coverage is complete.
Incoming maintainer messages are read-only; record them for owner review
without replying, acknowledging or reacting.

The closing live reconciliation at 2026-08-28T17:18:32Z found both contacts
open with no maintainer response. Selene remained mergeable and blocked only
on workflow approval with zero instantiated jobs; live duplicate searches
returned only the recorded PR and issue.

ElectronMail's owner responded positively but deferred evaluation at
2026-08-29T11:47:08Z and asked how Stackline packages are selected. The single
automated reply created at 2026-08-29T13:09:52Z was deleted by the owner. The
issue remains open and the question is intentionally unanswered. Effective
2026-08-29T16:34:03Z, incoming maintainer messages are read-only and must be
recorded for owner review without replying, acknowledging or reacting.

## Documentation record

Production documentation is at
<https://alexandro.net/docs/vanilla/fs-write-stream-atomic/>. The initial
documentation source commit is `a43939b2b703085c715af247d3ea86239c72d80a` and
the final deployed source commit is
`1725afaa59e5c8f207ce13bb43e259a4bf9e05ab`. CI run `33193330044` and CodeQL
run `33193328687` passed. Production matches the final root and compatibility
builds at 132/132 files and the standalone package at 18/18 files; all 12
package sitemap routes and all 18 canonical files were verified through the
origin and Cloudflare. The final commit guards the literal
`graceful-fs@4.2.11` text after edge verification exposed and corrected
Cloudflare email obfuscation.

## Canonical record

Canonical Drive project memory: `1uNbTz7UxQPCADyqNkfwkNw_1bX-K04aq`,
<https://drive.google.com/file/d/1uNbTz7UxQPCADyqNkfwkNw_1bX-K04aq/view>.
