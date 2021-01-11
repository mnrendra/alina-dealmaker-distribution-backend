const PORT = 3001
const MONGODB_URL = 'mongodb://localhost:27017/alina'
// const MONGODB_URL = 'mongodb+srv://root:lRZVu5v6nlc9NUwj@cluster0.ks14j.mongodb.net/alina-cs?retryWrites=true&w=majority'
const SOCKET_IO_CORS_ORIGIN = 'http://localhost:3000'
const SOCKET_IO_CORS_ALLOWED_HEADERS = ['lrzvu5v6nlc9nuwz']
const HASH_KEY = 'CendolD4w3t!'

const GOOGLE_API_CLIENT_ID = '874379942925-fidqnvc69q308cqtr6l2lljqangki75e.apps.googleusercontent.com'
const GOOGLE_API_CLIENT_SECRET = 'DOqZQqJN9s_bVL0QXJBkqcjz'
const GOOGLE_API_REDIRECT_URIS = ['http://localhost:8080/callback']
const GOOGLE_API_SCOPES = ['https://www.googleapis.com/auth/contacts']

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
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: (process.env.SOCKET_IO_CORS_ALLOWED_HEADERS || '').split(',')[0] ? (process.env.SOCKET_IO_CORS_ALLOWED_HEADERS || '').split(',') : SOCKET_IO_CORS_ALLOWED_HEADERS,
      credentials: true
    }
  },
  HASH_KEY: process.env.HASH_KEY || HASH_KEY,
  GOOGLE_APIS: {
    CLIENT_ID: process.env.GOOGLE_API_CLIENT_ID || GOOGLE_API_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_API_CLIENT_SECRET || GOOGLE_API_CLIENT_SECRET,
    REDIRECT_URIS: (process.env.GOOGLE_API_REDIRECT_URIS || '').split(',')[0] ? (process.env.GOOGLE_API_REDIRECT_URIS || '').split(',') : GOOGLE_API_REDIRECT_URIS,
    SCOPES: (process.env.GOOGLE_API_SCOPES || '').split(',')[0] ? (process.env.GOOGLE_API_SCOPES || '').split(',') : GOOGLE_API_SCOPES
  }
}
