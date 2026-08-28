# Upstream Audit and Intake Decision

Observation date: 2026-08-28 (primary-source checks completed between 16:00Z
and 16:17Z).

## Decision

**GO** to a compatibility-first local build of
`@stackline/fs-write-stream-atomic`, not to publication. The selected package
is queue rank 1 and the only remaining `CODEX_READY` entry. No `userPinned` or
`requiredNextCycle` pin exists, so neither the `QUALIFIED`
`adjust-sourcemap-loader` entry nor any `WATCH` entry may leapfrog it. Pin
resolution is therefore `NOT_PINNED`: there is no pin to retain, resolve, or
clear.

The runtime-topology gate passes because current callers need an incrementally
writable, backpressure-aware stream whose successful terminal events mean an
adjacent temporary file has already replaced the target. The reach/replacement
gate passes because direct current use is independently verified and no
maintained alternative preserves that contract. This decision permits local
implementation and verification only. Every release gate remains red until it
has actually passed.

## Identity and immutable source

- npm package: `fs-write-stream-atomic@1.0.10`
- publication: 2017-03-07T22:23:19.124Z
- deprecation: `This package is no longer supported.`
- canonical repository: <https://github.com/npm/fs-write-stream-atomic>
- repository state: archived and read-only since 2022-02-15
- release commit: `de157c0373a40fb5539640923cab9671cef08b12`
- latest commit: `00e9d75241d60db9c66353e092696000e7bcde2a`
  (CI maintenance, 2019-01-25T00:00:08Z)
- npm artifact SHA-1: `b47df53493ef911df75731e70a9ded0189db40c9`
- npm artifact SHA-256:
  `58cc72e8b57c5c6bdacc71b264fd0d1f2ae435b11d4ee6134d7fbfaf3bd0b0c6`
- npm integrity:
  `sha512-gehEzmPn2nAwr39eay+x3X34Ra+M2QlVUTLhkXPjWdeO8RF9kszk116avgBJM3ZyNHgHXBNx+VmPaFC36k0PzA==`
- license: ISC, Isaac Z. Schlueter and Contributors
- current npm write access: `saquibkhan`, `npm-cli-ops`, `reggi`

Primary records:

- <https://registry.npmjs.org/fs-write-stream-atomic/1.0.10>
- <https://registry.npmjs.org/fs-write-stream-atomic/-/fs-write-stream-atomic-1.0.10.tgz>
- <https://api.npmjs.org/downloads/point/2026-08-21:2026-08-27/fs-write-stream-atomic>
- <https://github.com/npm/fs-write-stream-atomic/tree/v1.0.10>
- <https://github.com/npm/fs-write-stream-atomic/issues>
- <https://github.com/npm/fs-write-stream-atomic/pulls>

The scoped npm name, local Verdaccio name, proposed public repository, and
proposed documentation route all returned not found before local work began.
No prior official build or publication exists to resume. A current automation
cycle had independently begun research and produced only the clean upstream
clone when this decision was frozen.

## Download observation

The official npm point endpoint returned **3,530,843 downloads** for the
complete UTC week 2026-08-21 through 2026-08-27, observed at
2026-08-28T16:16:58Z. The queue and Drive mirror recorded an earlier mutable
snapshot of 2,927,014 for the same period. The live primary-source observation
is used here; neither number is treated as direct-use proof.

## Published compatibility surface

The root CommonJS export is a function callable with or without `new`. It is a
Writable stream and forwards `encoding`, `mode`, `flags`, `highWaterMark`, and
other relevant stream/file options to the temporary write. The extra `chown`
option applies ownership before rename. `open` is forwarded from the physical
stream; successful `finish`, then `close`, occur only after that stream closes
and rename succeeds. Concurrent writers each publish one complete result, so
bytes from competing writers do not interleave.

The documented filename contract is a string. The temporary file is a sibling
of the target so the final rename stays on the same filesystem. Upstream's
`flags: 'a'` does not append to existing target contents: it appends to a new
temporary file and then replaces the target. That surprising result is a
compatibility fact to test and document, not silently reinterpret.

Atomic rename provides a visibility boundary, not a claim of crash durability.
The baseline does not fsync the file or its containing directory. It also
cannot infer errors from an unrelated source connected with bare `.pipe()`;
callers need `stream.pipeline()` or must explicitly destroy the destination.

## Issues, rejected patches, and bounded corrections

Open issues 1 and 12 establish temporary-file cleanup gaps around cancellation
and source-stream failures. Issue 16 requests append semantics and issue 17 a
custom temporary directory; both would change the core replacement or
same-filesystem invariant if implemented naively. Open PR 22 adds worker-thread
identity to temporary names, while PR 24 only changes historical CI.

Closed-unmerged does not mean every behavior was rejected. PRs 3 and 6 were
superseded by fixes that landed through other commits. PRs 9, 13, and 14 were
also superseded or manually integrated into the Writable rewrite and 1.0.10
Windows behavior. PR 7's cleanup timing and PR 18's stream dependency update
remain useful regression inputs, but their patches are not safe wholesale
merges.

The bounded local corrections are:

- core Writable rather than the retired `readable-stream` 1/2 dependency;
- exclusive, randomized adjacent temporary creation with process,
  worker-thread, and invocation identity;
- explicit destroy/error cleanup that waits for the physical stream to close;
- preservation of chown, mode, complete-winner concurrency, and Windows EPERM
  same-content comparison; and
- additive ESM and TypeScript declarations without altering the CommonJS call
  shape.

No official advisory affecting 1.0.10 was identified. Exclusive creation is
defense-in-depth for a predictable-name/symlink race, not a claim that an
assigned CVE exists.

## Current direct use

Current GitHub source supplies proof beyond download counts:

- `vladimiry/ElectronMail` at
  `a7a2c71548ef71cf2060a3b4114be62ea4be8d4d` declares exact 1.0.10 and
  constructs the stream with binary encoding and a 1 MiB high-water mark,
  using write callbacks, `drain`, and `finish` in database serialization;
- `Kampfkarren/selene` at
  `9d531b8d3755e139b26c534914e252239014bb3d` declares `^1.0.10`, pipes a
  downloaded executable with mode `0755`, and waits for `finish`; and
- supplemental source use exists in `mjeanroy/bower-npm-resolver` at
  `42e51b0e4bdf3e38044b432fa5952911a1799908` declares exact 1.0.10, pipes
  package archives into it, and observes `close`. GitHub reports a repository
  push in 2026, but the inspected default-branch head is dated 2023-05-19, so
  this is not classified as current default-branch maintenance.

`bower/bower` and `digidem/mapeo-desktop` provide additional direct source
uses. ElectronMail and selene supply the strong active-current proof for the
gate; the other repositories are supplemental compatibility evidence.

## Alternatives

`write-file-atomic@8.0.0` is actively maintained and provides fsync, ownership,
serialization, and worker identity, but accepts complete strings or buffers,
not a Writable stream. `@trenskow/atomic-write-stream@0.1.29` is current but
ESM-only with materially different construction/lifecycle semantics and no
effective test suite. `@parcel/fs-write-stream-atomic@2.6.0` is the closest API
fork and includes worker identity, but its latest publication is from 2022 and
it is maintained only as part of the Parcel monorepo. Native
`fs.createWriteStream` is not atomic. None is a maintained drop-in.

Alternative primary records:

- <https://github.com/npm/write-file-atomic>
- <https://registry.npmjs.org/%40trenskow%2Fatomic-write-stream/0.1.29>
- <https://github.com/trenskow/atomic-write-stream>
- <https://registry.npmjs.org/%40parcel%2Ffs-write-stream-atomic/2.6.0>

## Acceptance criteria

Publication remains blocked unless all of the following pass:

1. Preserve callable/newable CommonJS, Writable backpressure and callbacks,
   and `open -> finish -> close` success timing.
2. Preserve string paths, encoding, mode including `0755`, chown, flags,
   high-water marks, adjacent temporary files, and complete-winner concurrency.
3. Differentially prove the surprising append-as-replacement behavior rather
   than invent target append semantics.
4. Preserve same-content Windows rename EPERM success and different-content
   failure, including cleanup and event ordering.
5. Clean temporary files after explicit destroy, destination failure, and
   errors forwarded by `pipeline`; accurately document bare-pipe limits and
   unavoidable abrupt-process residue.
6. Prove distinct exclusive temporary names across worker threads and leave no
   residue after success or tested failures.
7. Pass the immutable 1.0.10 differential gate, CJS, ESM, TypeScript
   3.9/current, packed scoped and historical-key consumers.
8. Pass exact Node 14.15.1 through current Node, Windows and macOS CI, coverage,
   package quality, production/full audit, signature, and license checks.
9. Retain the ISC notice and state that Stackline is independent from and not
   endorsed by upstream.

Any regression in complete-winner atomic visibility, terminal-event timing,
mode/chown handling, cleanup, Windows behavior, package consumers, or supported
runtimes blocks publication.

## Canonical record

This dated GO decision is recorded in canonical Drive file
`1B1tSKaly_koV0s4qhSaxmModDOJgpId0`:
<https://drive.google.com/file/d/1B1tSKaly_koV0s4qhSaxmModDOJgpId0/view>.
