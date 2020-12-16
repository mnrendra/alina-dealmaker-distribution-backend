const crypto = require('crypto')
const router = require('express').Router()
const jwt = require('jsonwebtoken')

const { HASH_KEY } = require('../config')
const { validator } = require('../utils')
const { SuperAdmin, CustomerService } = require('../models')
const { notAllowedMethod, invalidField } = require('../errors')

// POST request
router.post('/', async (req, res, next) => {
  const { phone, password } = req.body

  if (!phone) {
    invalidField(res, 'Please fill in the phone number!')
    return
  }

  if (!password) {
    invalidField(res, 'Please fill in the password!')
    return
  }

  const { validPhone, dialCode, cellularCode } = validator.validatePhone(phone)

  if (!validPhone || !(dialCode || cellularCode)) {
    invalidField(res, 'Please input correct phone number!')
    return
  }

  try {
    const superAdmin = await SuperAdmin.findOne({ phone: validPhone })
    const customerService = await CustomerService.findOne({ phone: validPhone })

    const hash = crypto
      .createHmac('sha256', HASH_KEY)
      .update(password)
      .digest('hex')

    const sendResponse = (obj = {}) => {
      res.status(200).json({ status: 200, ...obj })
    }

    const checkPassword = (data = {}, type = '') => {
      if (hash === data.password) {
        const token = jwt.sign({ type, data }, HASH_KEY)
        sendResponse({ token })
      } else {
        sendResponse({ invalid: 'Password is invalid!' })
      }
    }

    if (superAdmin) checkPassword(superAdmin, 'admin')
    else if (customerService) checkPassword(customerService, 'customerService')
    else sendResponse({ invalid: 'Phone number not found!' })
  } catch (e) {
    next('Unable to login!', e)
  }
})

// ALL request
router.all('/', notAllowedMethod)

// export module
module.exports = router
