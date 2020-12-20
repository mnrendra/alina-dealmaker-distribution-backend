const PORT = 3001
const MONGODB_URL = 'mongodb://localhost:27017/alina'
// const MONGODB_URL = 'mongodb+srv://root:lRZVu5v6nlc9NUwj@cluster0.ks14j.mongodb.net/alina-cs?retryWrites=true&w=majority'
const SOCKET_IO_CORS_ORIGIN = 'http://localhost:3000'
const SOCKET_IO_CORS_ALLOWED_HEADERS = 'lrzvu5v6nlc9nuwz'
const HASH_KEY = 'CendolD4w3t!'

console.log(process.env.MONGODB_URL, MONGODB_URL)
console.log(process.env.SOCKET_IO_CORS_ORIGIN, SOCKET_IO_CORS_ORIGIN)
console.log(process.env.SOCKET_IO_CORS_ALLOWED_HEADERS, SOCKET_IO_CORS_ALLOWED_HEADERS)

module.exports = {
  PORT: process.env.PORT || PORT,
  MONGODB_URL: process.env.MONGODB_URL || MONGODB_URL,
  MONGODB_OPT: {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  },
  SOCKETIO_OPT: {
    cors: {
      origin: process.env.SOCKET_IO_CORS_ORIGIN || SOCKET_IO_CORS_ORIGIN,
      // origin: '*:*',
      // origin: 'https://puspanegara.com',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: [process.env.SOCKET_IO_CORS_ALLOWED_HEADERS || SOCKET_IO_CORS_ALLOWED_HEADERS],
      // allowedHeaders: ['lRZVu5v6nlc9NUwj'],
      credentials: true
    }
  },
  HASH_KEY: process.env.HASH_KEY || HASH_KEY
}
