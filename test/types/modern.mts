import createWriteStreamAtomic, { WriteStreamAtomic } from '@stackline/fs-write-stream-atomic'

const direct = createWriteStreamAtomic('direct.txt', { flags: 'w', mode: 0o640 })
const constructed: WriteStreamAtomic = new WriteStreamAtomic('constructed.txt')

direct.end(Buffer.from('value'))
constructed.destroy()
