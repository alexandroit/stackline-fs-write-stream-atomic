'use strict'

const crypto = require('crypto')
const fs = require('graceful-fs')
const path = require('path')
const { Writable } = require('stream')
const util = require('util')

let threadId = 0
try {
  threadId = require('worker_threads').threadId
} catch (_) {
  // worker_threads is unavailable on very old supported Node.js releases.
}

let invocations = 0

function exclusiveFlags(flags) {
  switch (flags) {
    case undefined: return 'wx'
    case 'w': return 'wx'
    case 'w+': return 'wx+'
    case 'a': return 'ax'
    case 'a+': return 'ax+'
    case 'as': return fs.constants.O_APPEND | fs.constants.O_CREAT |
      fs.constants.O_EXCL | fs.constants.O_SYNC | fs.constants.O_WRONLY
    case 'as+': return fs.constants.O_APPEND | fs.constants.O_CREAT |
      fs.constants.O_EXCL | fs.constants.O_RDWR | fs.constants.O_SYNC
    default: return flags
  }
}

function getTmpname(filename) {
  const target = String(filename)
  const token = [
    process.pid,
    threadId,
    ++invocations,
    crypto.randomBytes(12).toString('hex')
  ].join('-')
  return path.join(path.dirname(target), `${path.basename(target)}.${token}`)
}

function hashFile(filename, callback) {
  const hash = crypto.createHash('sha512')
  const input = fs.createReadStream(filename)
  let digest
  let error

  input.on('data', (chunk) => hash.update(chunk))
  input.once('error', (value) => { error = value })
  input.once('end', () => { digest = hash.digest('hex') })
  // Wait for the descriptor to close before allowing cleanup. On Windows an
  // early hash error followed by unlink can otherwise leave the sibling
  // temporary file behind while the other hash stream still owns it.
  input.once('close', () => callback(error, digest))
}

function filesMatch(left, right, callback) {
  hashFile(left, (error, digest) => {
    if (error) {
      callback(error)
      return
    }
    hashFile(right, (rightError, rightDigest) => {
      callback(rightError, !rightError && digest === rightDigest)
    })
  })
}

module.exports = WriteStreamAtomic

util.inherits(WriteStreamAtomic, Writable)

/**
 * A Writable whose completed contents replace `filename` with one adjacent
 * rename. It is intentionally callable with or without `new`.
 */
function WriteStreamAtomic(filename, options) {
  if (!(this instanceof WriteStreamAtomic)) {
    return new WriteStreamAtomic(filename, options)
  }

  const supplied = options || {}
  const writableOptions = { ...supplied, autoDestroy: true, emitClose: true }
  delete writableOptions.chown
  delete writableOptions.isWin
  Writable.call(this, writableOptions)

  this.__isWin = Object.prototype.hasOwnProperty.call(supplied, 'isWin')
    ? supplied.isWin
    : process.platform === 'win32'
  this.__atomicTarget = filename
  this.__atomicTmp = getTmpname(filename)
  this.__atomicChown = supplied.chown
  this.__atomicClosed = false
  this.__atomicCommitted = false
  this.__atomicFinalizing = false
  this.__atomicFinalCallback = null
  this.__atomicInnerClosed = false
  this.__atomicInnerError = null
  this.__atomicWriteCallback = null
  this.__atomicDrainListener = null

  const fileOptions = { ...supplied, autoClose: true, emitClose: true }
  delete fileOptions.chown
  delete fileOptions.isWin
  fileOptions.flags = exclusiveFlags(fileOptions.flags)

  this.__atomicStream = fs.createWriteStream(this.__atomicTmp, fileOptions)
  this.__atomicStream.once('open', (descriptor) => {
    if (!this.destroyed) this.emit('open', descriptor)
  })
  this.__atomicStream.once('error', (error) => this.__handleAtomicError(error))
  this.__atomicStream.once('close', () => this.__handleAtomicClose())
}

WriteStreamAtomic.prototype._write = function (chunk, encoding, callback) {
  if (this.__atomicInnerError) {
    callback(this.__atomicInnerError)
    return
  }

  try {
    if (this.__atomicStream.write(chunk, encoding)) {
      callback()
      return
    }

    this.__atomicWriteCallback = callback
    this.__atomicDrainListener = () => {
      const pending = this.__atomicWriteCallback
      this.__atomicWriteCallback = null
      this.__atomicDrainListener = null
      if (pending) pending()
    }
    this.__atomicStream.once('drain', this.__atomicDrainListener)
  } catch (error) {
    callback(error)
  }
}

WriteStreamAtomic.prototype._final = function (callback) {
  this.__atomicFinalCallback = callback
  if (this.__atomicInnerError) {
    this.__completeFinal(this.__atomicInnerError)
    return
  }

  this.__atomicStream.end()
  if (this.__atomicInnerClosed) this.__finalizeAtomicWrite()
}

WriteStreamAtomic.prototype._destroy = function (error, callback) {
  this.__atomicFinalCallback = null
  if (this.__atomicDrainListener) {
    this.__atomicStream.removeListener('drain', this.__atomicDrainListener)
    this.__atomicDrainListener = null
  }
  if (this.__atomicWriteCallback) {
    const writeCallback = this.__atomicWriteCallback
    this.__atomicWriteCallback = null
    const writeError = error || Object.assign(
      new Error('Cannot complete write after the stream was destroyed'),
      { code: 'ERR_STREAM_DESTROYED' }
    )
    process.nextTick(writeCallback, writeError)
  }

  if (this.__atomicCommitted) {
    setImmediate(() => callback(error))
    return
  }

  const cleanup = () => {
    fs.unlink(this.__atomicTmp, (unlinkError) => {
      this.__atomicClosed = true
      if (unlinkError && unlinkError.code !== 'ENOENT' && !error) {
        callback(unlinkError)
      } else {
        callback(error)
      }
    })
  }

  if (this.__atomicInnerClosed) {
    cleanup()
    return
  }

  this.__atomicStream.once('close', cleanup)
  this.__atomicStream.destroy()
}

WriteStreamAtomic.prototype.__handleAtomicError = function (error) {
  this.__atomicInnerError = error
  if (this.__atomicDrainListener) {
    this.__atomicStream.removeListener('drain', this.__atomicDrainListener)
    this.__atomicDrainListener = null
  }

  if (this.__atomicWriteCallback) {
    const callback = this.__atomicWriteCallback
    this.__atomicWriteCallback = null
    callback(error)
  } else if (this.__atomicFinalCallback) {
    this.__completeFinal(error)
  } else {
    this.destroy(error)
  }
}

WriteStreamAtomic.prototype.__handleAtomicClose = function () {
  this.__atomicInnerClosed = true
  if (this.__atomicFinalCallback && !this.destroyed) {
    this.__finalizeAtomicWrite()
  }
}

WriteStreamAtomic.prototype.__completeFinal = function (error) {
  const callback = this.__atomicFinalCallback
  this.__atomicFinalCallback = null
  if (callback) callback(error)
}

WriteStreamAtomic.prototype.__finalizeAtomicWrite = function () {
  if (this.__atomicFinalizing || this.__atomicCommitted || this.destroyed) return
  this.__atomicFinalizing = true

  const rename = () => {
    if (this.destroyed) return
    fs.rename(this.__atomicTmp, this.__atomicTarget, (error) => {
      if (!error) {
        this.__atomicCommitted = true
        this.__atomicClosed = true
        this.__completeFinal()
        return
      }
      this.__handleRenameError(error)
    })
  }

  if (this.__atomicChown) {
    fs.chown(
      this.__atomicTmp,
      this.__atomicChown.uid,
      this.__atomicChown.gid,
      (error) => error ? this.__completeFinal(error) : rename()
    )
  } else {
    rename()
  }
}

WriteStreamAtomic.prototype.__handleRenameError = function (error) {
  const isWindowsRenameEperm = this.__isWin && error &&
    error.syscall === 'rename' && error.code === 'EPERM'

  if (!isWindowsRenameEperm) {
    this.__completeFinal(error)
    return
  }

  filesMatch(this.__atomicTmp, this.__atomicTarget, (hashError, match) => {
    if (hashError || !match) {
      this.__completeFinal(error)
      return
    }
    fs.unlink(this.__atomicTmp, () => {
      this.__atomicCommitted = true
      this.__atomicClosed = true
      this.__completeFinal()
    })
  })
}

Object.defineProperty(module.exports, 'WriteStreamAtomic', {
  configurable: false,
  enumerable: false,
  value: WriteStreamAtomic,
  writable: false
})
