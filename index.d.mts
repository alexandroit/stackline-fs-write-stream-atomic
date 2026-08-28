/// <reference types="node" />

import { Writable, WritableOptions } from 'stream'

export interface Chown {
  uid: number
  gid: number
}

export interface Options extends WritableOptions {
  chown?: Chown
  encoding?: BufferEncoding
  flags?: string
  mode?: number | string
}

export class WriteStreamAtomic extends Writable {
  constructor(filename: string, options?: Options)
  readonly __atomicTarget: string
  readonly __atomicTmp: string
  readonly __atomicClosed: boolean
}

declare function createWriteStreamAtomic(
  filename: string,
  options?: Options
): WriteStreamAtomic

export default createWriteStreamAtomic
