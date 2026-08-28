# Registry Handoff

- upstream: `fs-write-stream-atomic@1.0.10`
- target: `@stackline/fs-write-stream-atomic@1.0.0`
- decision: GO, frozen 2026-08-28
- state: `PUBLISHED`
- queue selection: rank 1 `CODEX_READY`
- user pin: `NOT_PINNED`
- runtime: Node.js `>=14.15.1`
- preserved: callable/newable CJS Writable, string paths, backpressure,
  chown/mode/options, adjacent rename, complete-winner concurrency,
  append-as-replacement, and finish-before-close timing
- additive: ESM and TypeScript declarations
- production dependency: exact `graceful-fs@4.2.11`
- source/tag commit: `8a24db30a73feba4540186a5034a44ea81d3cf62`
- main CI / CodeQL: 33191259807 / 33191259803
- tag CI / CodeQL: 33192270974 / 33192270992
- artifact SHA-1: `77a0ebaac6c862f4e337f18410faf51cae7fe630`
- artifact SHA-256:
  `a6d985cb143cba8bbae9da7d72ce258e9fb6c4e92a41d70005ace7502b533fd3`
- artifact integrity:
  `sha512-8i1isxdsAzUBIW+vGB33+y0arRUZaVC7zFr+xH48KM/45xjF/UeOPjRottnrUIv+45TCpCkrOBOVqGFKEh1dQg==`
- Verdaccio: exact-byte tarball and clean scoped/historical-key consumers PASS
- official npm: created 2026-08-28T16:50:00.660Z; full metadata propagated
  2026-08-28T16:54:55Z after one transient full-packument E404 and no republish
- official npm consumers: exact-byte tarball plus clean unauthenticated scoped,
  historical-key, CommonJS, ESM, and deep-entry PASS
- npm: <https://www.npmjs.com/package/@stackline/fs-write-stream-atomic>
- canonical immutable release:
  <https://github.com/alexandroit/stackline-fs-write-stream-atomic/releases/tag/v1.0.0>
- canonical release: `immutable: true`, ten exact assets, published
  2026-08-28T16:59:08Z
- documentation:
  <https://alexandro.net/docs/vanilla/fs-write-stream-atomic/>
- documentation source commit:
  [`a43939b2b703085c715af247d3ea86239c72d80a`](https://github.com/alexandroit/stackline-open-source/commit/a43939b2b703085c715af247d3ea86239c72d80a)
- final deployed source commit, including the Cloudflare email-obfuscation
  guard:
  [`1725afaa59e5c8f207ce13bb43e259a4bf9e05ab`](https://github.com/alexandroit/stackline-open-source/commit/1725afaa59e5c8f207ce13bb43e259a4bf9e05ab)
- documentation [CI 33193330044](https://github.com/alexandroit/stackline-open-source/actions/runs/33193330044)
  and [CodeQL 33193328687](https://github.com/alexandroit/stackline-open-source/actions/runs/33193328687): PASS
- production comparison: root and compatibility catalogs 132/132 files,
  standalone package 18/18 files, 12/12 package sitemap routes, and all 18
  canonical package files returned HTTP 200 with the expected MIME type

## Immutability preflight record

[`stackline-v1.0.0`](https://github.com/alexandroit/stackline-fs-write-stream-atomic/releases/tag/stackline-v1.0.0)
was published while the repository immutability setting was false and remains
untouched mutable. The setting was enabled immediately; the release was not
deleted, moved, or recreated. Canonical `v1.0.0` was created as a draft with
the exact assets and only then published immutable. The installed `gh` CLI has
no attestation command; GitHub API `immutable`/asset-digest results and an
independently downloaded byte-identical tarball are the verification evidence.

Use the canonical immutable `v1.0.0` release and published npm bytes. Do not
rebuild, replace, or republish version 1.0.0.

## Adoption handoff

- Pull request: <https://github.com/Kampfkarren/selene/pull/686>, base
  `9d531b8d3755e139b26c534914e252239014bb3d`, head
  `a94cbb8f0e3d837f704fa2100c7d66062a453d19`; only
  `selene-vscode/package.json` and `selene-vscode/package-lock.json` changed.
- Pull-request validation: clean baseline and changed-tree installs, compile,
  ESLint, Prettier, alias resolution, CommonJS deep entries, and atomic cleanup
  PASS; audit count unchanged at 23.
- Pull-request workflows: `action_required`, zero jobs created, pending
  maintainer approval. This is not a changed-tree test failure.
- Different-repository issue:
  <https://github.com/vladimiry/ElectronMail/issues/782>, base
  `a7a2c71548ef71cf2060a3b4114be62ea4be8d4d`; exact `package.json`
  development dependency and
  `src/electron-main/database/serialization/util.ts` constructor use recorded.
  Focused Node.js 24 and TypeScript 6 shape PASS; issue open with zero comments,
  disclosure and neutral options present, no security claim.
- Different-repository check: `PASS`; adoption coverage: `COMPLETE`.
- Do not send an unsolicited follow-up. Respond only to a concrete maintainer
  question with evidence.

## Canonical Drive records

- GO decision: `1B1tSKaly_koV0s4qhSaxmModDOJgpId0`
- project memory: `1uNbTz7UxQPCADyqNkfwkNw_1bX-K04aq`
- release verification: `1Iatk4L5mHh8zCqZDYSxMth1ZlOkVBBIR`
- adoption targets: `1nq_KJTlKLYlat8pLeiCdpIsq89bu22-i`
- registry handoff: `1iiYfATj5YYnsc902ibdBIBiqcVKDMynZ`
