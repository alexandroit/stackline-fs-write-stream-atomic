# Migration

## Lowest-change alias

For Node.js 14.15.1 or newer, retain the historical dependency key:

```sh
npm install fs-write-stream-atomic@npm:@stackline/fs-write-stream-atomic
```

Existing `require('fs-write-stream-atomic')` calls then remain unchanged. For
an explicit scoped migration, change the import to
`require('@stackline/fs-write-stream-atomic')` or use the ESM default export.

Commit the manifest and lockfile, install cleanly, and run real filesystem
integration tests. In particular, exercise high-water-mark backpressure,
executable modes, chown where applicable, finish/close timing, cancellation,
and Windows replacement behavior.

## Behavior to review

- Temporary creation is randomized and exclusive rather than predictable.
- `destroy()` and errors forwarded through `pipeline()` remove temporary files.
- Append flags still replace the target with the newly streamed value; they do
  not append to the old target.
- The production graph retains the historical `graceful-fs` key through exact
  `npm:@stackline/graceful-fs@1.0.0` and removes `iferr`, `imurmurhash`, and
  `readable-stream`.
- The public path declaration is deliberately string-only, matching upstream
  documentation. Do not infer URL or Buffer support from modern `fs` APIs.

Atomic visibility does not mean crash durability. If the caller needs fsync,
directory fsync, serialized same-target writes, or whole-buffer convenience,
evaluate `write-file-atomic` instead.

## Rollback

Restore the previous dependency range and lockfile and reinstall. The package
owns no persistent migration metadata, but rollback cannot undo files already
replaced by completed stream operations.
