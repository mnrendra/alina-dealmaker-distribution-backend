module.exports = {
  PORT: 3001,
  MONGODB_URL: 'mongodb://localhost:27017/alina',
  // MONGODB_URL: 'mongodb+srv://root:lRZVu5v6nlc9NUwj@cluster0.ks14j.mongodb.net/alina-cs?retryWrites=true&w=majority',
  MONGODB_OPT: {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  },
  SOCKETIO_OPT: {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['lRZVu5v6nlc9NUwj'],
      credentials: true
    }
  },
  HASH_KEY: 'CendolD4w3t!'
}
