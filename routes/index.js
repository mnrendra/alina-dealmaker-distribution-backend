const router = require('express').Router()

const socketIOSanity = require('./socketIOSanity')
const superAdmin = require('./superAdmin')
const customerService = require('./customerService')
const auth = require('./auth')
const lead = require('./lead')

const { errorHandler, notFoundEndpoint } = require('../errors')

const routes = (io = {}) => {
  // routing midlleware
  router.use('/api/socket.io', socketIOSanity)
  router.use('/api/super-admin', superAdmin)
  router.use('/api/customer-service', customerService)
  router.use('/api/auth', auth)
  router.use('/api/lead', lead(io))
  // error middleware
  router.use('/*', notFoundEndpoint)
  router.use(errorHandler)
  // return router
  return router
}

// export module
module.exports = routes
