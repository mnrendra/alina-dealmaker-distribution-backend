const http = require('http')
const socketIO = require('socket.io')
const config = require('../config')

const SOCKETIO_OPT = process.env.SOCKETIO_OPT || config.SOCKETIO_OPT || {}

const joinRoom = (socket, { type, userIds }) => {
  if (type === 'superAdmin') {
    console.log('superAdmin:', userIds)

    userIds.forEach(userId => {
      socket.join(userId)
    })
  } else if (type === 'dealMaker') {
    console.log('dealMaker:', '' + userIds[0])

    socket.join('' + userIds[0])
  } else {
    console.log('anonymous:', { type, userIds })
  }
}

const initSocketIO = (app) => {
  const server = http.createServer(app)
  const io = socketIO(server, SOCKETIO_OPT)

  io.on('connection', (socket) => {
    console.log('connected:', socket.id)

    socket.on('join', (data = {}) => {
      joinRoom(socket, data)
    })

    socket.on('disconnect', () => {
      console.log('disconnected:', socket.id)
    })
  })

  return { server, io }
}

module.exports = initSocketIO
