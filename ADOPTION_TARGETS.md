# Adoption Targets

Observation date: 2026-08-28.

This is a dated compatibility and contact record, not evidence of maintainer
approval. `@stackline/fs-write-stream-atomic@1.0.0` is publicly verified.

## Pull request lane — OPEN

The focused migration pull request is
<https://github.com/Kampfkarren/selene/pull/686>. It targets
`Kampfkarren/selene` base commit
`9d531b8d3755e139b26c534914e252239014bb3d` from head commit
`a94cbb8f0e3d837f704fa2100c7d66062a453d19`. The changed tree contains only
`selene-vscode/package.json` and `selene-vscode/package-lock.json`; the exact
historical-key alias is
`fs-write-stream-atomic: npm:@stackline/fs-write-stream-atomic@1.0.0`.

Clean baseline and changed-tree installs, compilation, ESLint, Prettier, alias
resolution, CommonJS root and deep-entry loading, and atomic commit/temporary
cleanup checks all passed. The audit remained at the same 23 existing findings
before and after the migration.

Four repository workflow runs report `action_required` and created no jobs
while waiting for a maintainer to approve fork-contributor execution. This is
an external approval gate, not a changed-tree test failure.

## Maintainer-decision issue — OPEN

The different-repository issue is
<https://github.com/vladimiry/ElectronMail/issues/782>, based on ElectronMail
commit `a7a2c71548ef71cf2060a3b4114be62ea4be8d4d`. It identifies the exact
`fs-write-stream-atomic@1.0.10` `devDependencies` entry in `package.json` and
the newable constructor use in
`src/electron-main/database/serialization/util.ts`. A focused Node.js 24 and
TypeScript 6 smoke matching that constructor, binary encoding, high-water-mark,
and lifecycle shape passed.

The issue is open with zero comments. It discloses that the proposer maintains
the independent Stackline package and is not affiliated with ElectronMail or
the original package maintainers. It offers aliasing, vendoring or another
contract-tested implementation, and intentional retention as neutral choices;
it makes no security claim.

## Coverage

The pull request and issue target different repositories: **PASS**. The required
one-PR/one-issue adoption coverage is **COMPLETE**. Do not send an unsolicited
follow-up; monitor and respond only to a concrete maintainer question with
evidence.

## Canonical record

Canonical Drive adoption record: `1nq_KJTlKLYlat8pLeiCdpIsq89bu22-i`,
<https://drive.google.com/file/d/1nq_KJTlKLYlat8pLeiCdpIsq89bu22-i/view>.
