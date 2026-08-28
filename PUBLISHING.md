# Publishing

Releases use one operator-frozen npm tarball. GitHub Actions has no npm write
credential and must not publish a separately packed artifact.

## Ordered release protocol

1. Confirm the target version is absent from Verdaccio and official npm.
2. Commit the complete package and release tooling. Require green main-branch
   CI and CodeQL for that exact clean source commit.
3. Run `npm run artifact:prepare` once. Review the frozen tarball, inventory,
   checksums, license record, and CycloneDX SBOM. Record the exact source
   commit and toolchain; do not rebuild that version.
4. Publish that exact tarball path to Verdaccio. Fetch it, byte-compare it with
   the frozen candidate, and run clean scoped plus historical-key alias
   consumers.
5. Publish the same bytes once to official npm. Fetch and byte-compare them and
   repeat the clean consumers. A successful publish followed by a transient
   metadata/read failure is a propagation check, never permission to
   republish.
6. Point `stackline-v<version>` at the already-green source commit. Require tag
   CI and CodeQL, then create the immutable GitHub release with the exact
   tarball, checksums, inventory, license record, release notes, manifest, and
   SBOM.
7. Record registry, tag, release, and documentation evidence without modifying
   or replacing the immutable artifact.

Never run `npm publish .`, publish a moving worktree, rebuild after a registry
accepts the version, or bypass human-factor authentication. Every remote step
requires its own authorization.
