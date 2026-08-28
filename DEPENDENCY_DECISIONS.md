# Dependency Decisions

## Production

Exact `graceful-fs@4.2.11` is retained to preserve the upstream filesystem
compatibility layer and descriptor-pressure behavior. It is ISC-licensed and
current within its stable major line.

The upstream runtime dependencies `iferr`, `imurmurhash`, and
`readable-stream` are removed. Small error routing is local, cryptographic
randomness replaces predictable Murmur-derived names, and Node core Writable
supports the declared Node.js floor.

## Development

Development tools are exact-pinned and excluded from the artifact. The
immutable baseline is installed under the alias
`fs-write-stream-atomic-upstream` solely for differential tests. TypeScript
3.9 plus current TypeScript exercise legacy and modern consumers.
