# Security

Report suspected vulnerabilities through the private GitHub security advisory
form for the eventual project repository. Do not disclose an unfixed issue in
a public ticket. Include package/Node versions, operating system and
filesystem, a minimal reproduction, target and temporary path behavior, event
order, and impact.

## Supported line

The latest `1.x` line targets Node.js 14.15.1 and newer.

## Filesystem boundary

The caller chooses the target path and must enforce its own allowed root,
permissions, ownership policy, disk limits, cancellation, and trust boundary.
Temporary files are adjacent, randomized, and opened exclusively. The final
rename is a visibility boundary only: file and directory fsync are not
performed, so power-loss durability is not promised.

Use `pipeline()` or explicitly destroy the destination when a source fails.
Bare `.pipe()` does not transfer source errors. Abrupt process termination can
leave temporary files because no JavaScript cleanup is guaranteed after exit.

No official advisory affecting upstream 1.0.10 was identified during the
2026-08-28 intake. The exclusive-name correction is defense-in-depth and must
not be represented as an assigned vulnerability or CVE.
