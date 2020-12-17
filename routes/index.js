const router = require('express').Router()

const socketIOSanity = require('./socketIOSanity')
const superAdmin = require('./superAdmin')
const customerService = require('./customerService')
const auth = require('./auth')
const lead = require('./lead')

const { errorHandler, notFoundEndpoint } = require('../errors')

const routes = (io = {}) => {
  // routing midlleware
  router.use('/socket.io', socketIOSanity)
  router.use('/super-admin', superAdmin)
  router.use('/customer-service', customerService)
  router.use('/auth', auth)
  router.use('/lead', lead(io))
  // error middleware
  router.use('/*', notFoundEndpoint)
  router.use(errorHandler)
  // return router
  return router
}

// export module
module.exports = routes
