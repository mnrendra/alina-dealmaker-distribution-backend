const router = require('express').Router()

const customerService = require('./customerService')
const lead = require('./lead')
const superAdmin = require('./superAdmin')
const auth = require('./auth')
const home = require('./home')

const { errorHandler, notFoundEndpoint } = require('../errors')

const routes = (io = {}) => {
  // routing midlleware
  router.use('/socket.io', home)
  router.use('/customer-service', customerService)
  router.use('/lead', lead(io))
  router.use('/super-admin', superAdmin)
  router.use('/auth', auth)
  // error middleware
  router.use('/*', notFoundEndpoint)
  router.use(errorHandler)
  //
  return router
}

// export module
module.exports = routes
