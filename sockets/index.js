const http = require('http')
const socketIO = require('socket.io')

const OPTIONS = {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['lRZVu5v6nlc9NUwj'],
    credentials: true
  }
}

const joinRoom = (socket, { type, userIds }) => {
  if (type === 'superAdmin') {
    console.log('superAdmin', userIds)
    userIds.forEach(userId => {
      socket.join(userId)
    })
  } else if (type === 'dealMaker') {
    console.log('dealMaker', '' + userIds[0])
    socket.join('' + userIds[0])
  } else {
    console.log('Error on joining socket room', { type, userIds })
  }
}

const initSocketIO = (app) => {
  const server = http.createServer(app)
  const io = socketIO(server, OPTIONS)

  io.on('connection', (socket) => {
    console.log('================', socket.id)

    socket.on('join', data => joinRoom(socket, data))

    socket.on('disconnect', () => console.log('----------------', socket.id))
  })

  return { server, io }
}

module.exports = initSocketIO
