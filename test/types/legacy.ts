import createWriteStreamAtomic = require('../..')

const direct = createWriteStreamAtomic('direct.txt', { encoding: 'utf8', highWaterMark: 16 })
const constructed = new createWriteStreamAtomic.WriteStreamAtomic('constructed.txt', {
  chown: { gid: 1, uid: 1 },
  mode: 0o600
})

direct.end('value')
constructed.destroy()
