const mongoose = require('mongoose')

const mongodb = async (url) => {
  const DB_URL = process.env.DB_URL || url || 'mongodb://localhost:27017/alina'
  // const DB_URL = process.env.DB_URL || url || 'mongodb+srv://root:lRZVu5v6nlc9NUwj@cluster0.ks14j.mongodb.net/alina-cs?retryWrites=true&w=majority'

  try {
    const { connections } = await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
    })

    if (!connections || !connections.length) throw new Error('MongoDB Error: there is no connections!')

    const { user, host, port, name } = connections[0]
    console.log(`the 'mongoose' connected on ${user ? user + '@' : ''}${host}:${port}/${name}`)
    return true
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = mongodb
