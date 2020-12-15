const mongoose = require('mongoose')

const mongodb = async (url, options) => {
  try {
    const { connections } = await mongoose.connect(url, options)

    if (!connections || !connections.length) throw new Error('MongoDB Error: there is no connections!')

    const { user, host, port, name } = connections[0]
    console.log(`the 'mongoose' connected on ${user ? user + '@' : ''}${host}:${port}/${name}`)

    return true
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = mongodb
