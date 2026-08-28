# Issue and Patch Triage

Observed 2026-08-28 against upstream 1.0.10.

| Record | Assessment | Local action |
| --- | --- | --- |
| Issue 1: process cancellation residue | Real limit; cleanup cannot be guaranteed after abrupt termination | Clean explicit destroy; document abrupt-exit boundary |
| Issue 12: source error residue/propagation | Destination cannot observe bare-pipe source errors | Test `pipeline()` cleanup and document explicit destroy |
| Issue 16: append request | Upstream `a` replaces target from a fresh temporary | Differentially freeze and document; do not invent atomic append |
| Issue 17: custom temporary path | Can cross filesystems and defeat atomic rename | Keep adjacent temporary invariant |
| PR 22: worker identity | Directionally correct but incomplete alone | Include worker id plus invocation and random identity, open exclusively |
| PR 24: ppc64le Travis | Historical CI-only change | Do not import; use current platform matrix |
| PRs 7/9/13/14/18 | Mixed cleanup, lifecycle, Windows, and dependency evidence | Convert behavior to focused tests; do not cherry-pick wholesale |

Several closed-unmerged patches were superseded or manually integrated.
Patch state alone is not used as evidence that a behavior was rejected.
