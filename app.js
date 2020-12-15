const express = require('express')
const helmet = require('helmet')
const compression = require('compression')
const cors = require('cors')

const initSocketIO = require('./sockets')
const { invalidJsonHandler } = require('./errors')
const routes = require('./routes')

const app = express()
const { server, io } = initSocketIO(app)

app.use(cors())
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(invalidJsonHandler)
app.use(routes(io))

module.exports = server
