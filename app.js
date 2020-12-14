const express = require('express')
const helmet = require('helmet')
const compression = require('compression')
const cors = require('cors')
// require local modules
const routes = require('./routes')
const { invalidJsonHandler } = require('./errors')
const initSocketIO = require('./sockets')

// set init app
const app = express()
const { server, io } = initSocketIO(app)

// middleware
app.use(cors())
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(invalidJsonHandler)
app.use(routes(io))

module.exports = server
