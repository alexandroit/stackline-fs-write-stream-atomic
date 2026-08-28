/// <reference types="node" />

import { Writable, WritableOptions } from 'stream'

declare function createWriteStreamAtomic(
  filename: string,
  options?: createWriteStreamAtomic.Options
): createWriteStreamAtomic.WriteStreamAtomic

declare namespace createWriteStreamAtomic {
  interface Chown {
    uid: number
    gid: number
  }

  interface Options extends WritableOptions {
    chown?: Chown
    encoding?: BufferEncoding
    flags?: string
    mode?: number | string
  }

  class WriteStreamAtomic extends Writable {
    constructor(filename: string, options?: Options)
    readonly __atomicTarget: string
    readonly __atomicTmp: string
    readonly __atomicClosed: boolean
  }
}

export = createWriteStreamAtomic
