const crypto = require('crypto')
const router = require('express').Router()
const jwt = require('jsonwebtoken')

const { SuperAdmin, CustomerService } = require('../models')
const { validator, keys } = require('../utils')
const { notAllowedMethod, invalidField } = require('../errors')

// POST request
router.post('/', async (req, res, next) => {
  const { phone, password } = req.body

  const { validPhone, dialCode, cellularCode } = validator.validatePhone(phone)

  if (!validPhone || !(dialCode || cellularCode)) {
    invalidField(res, 'Please input correct phone number!')
    return
  }

  try {
    const superAdmin = await SuperAdmin.findOne({ phone: validPhone })
    const customerService = await CustomerService.findOne({ phone: validPhone })

    const hash = crypto
      .createHmac('sha256', keys.hash)
      .update(password)
      .digest('hex')

    const sendResponse = (obj = {}) => {
      res.status(200).json({ status: 200, ...obj })
    }

    const checkPassword = (data = {}, type = '') => {
      if (hash === data.password) {
        const token = jwt.sign({ type, data }, keys.hash)
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
