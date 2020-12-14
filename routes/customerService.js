const crypto = require('crypto')
const router = require('express').Router()
const { isValid } = require('mongoose').Types.ObjectId

const { CustomerService } = require('../models')
const { validator, keys } = require('../utils')
const { notAllowedMethod, requireId, invalidField, alreadyCreated, invalidId, notFoundId } = require('../errors')

// GET request
router.get('/', async (req, res) => {
  const docs = await CustomerService.find()
  const rows = docs.map(({ _id, name, phone, active, isTurn, leads, created, updated }) => ({
    _id,
    name,
    phone,
    active,
    isTurn,
    leads,
    created,
    updated
  }))

  res.status(200).json({
    total: docs.length,
    rows
  })
})

router.get('/:id', async (req, res) => {
  const { id } = req.params

  if (!isValid(id)) {
    invalidId(res, id)
    return
  }

  const doc = await CustomerService.findOne({ _id: id })
  if (!doc) {
    notFoundId(res, id)
    return
  }

  const { _id, name, phone, created, updated } = doc
  res.status(200).json({
    _id,
    name,
    phone,
    created,
    updated
  })
})

// POST request
router.post('/', async (req, res, next) => {
  const { name, phone, password } = req.body

  const { validPhone, dialCode, cellularCode } = validator.validatePhone(phone)

  if (!validPhone || !(dialCode || cellularCode)) {
    invalidField(res, 'Invalid phone number!')
    return
  }

  const doc = await CustomerService.findOne({ phone: validPhone })
  if (doc) {
    alreadyCreated(res, 'phone', validPhone)
    return
  }

  const docName = await CustomerService.findOne({ name })
  if (docName) {
    alreadyCreated(res, 'name', validPhone)
    return
  }

  const hash = crypto
    .createHmac('sha256', keys.hash)
    .update(password)
    .digest('hex')

  const newCustomerService = new CustomerService({
    name,
    phone: validPhone,
    password: hash,
    active: true
  })

  try {
    const { _id, name, phone, active, isTurn, created, updated } = await newCustomerService.save()
    res.status(201).json({
      status: 201,
      success: {
        name: 'Success save new CustomerService!',
        data: {
          id: _id,
          name,
          phone,
          active,
          isTurn,
          created,
          updated
        }
      }
    })
  } catch (e) {
    next('Can\t save new CustomerService!', e)
  }
})

// PUT request
router.put('/', requireId)
router.put('/:id', async (req, res, next) => {
  const { id } = req.params

  if (!isValid(id)) {
    invalidId(res, id)
    return
  }

  const doc = await CustomerService.findOne({ _id: id })
  if (!doc) {
    notFoundId(res, id)
    return
  }

  const updatedCustomerService = doc

  const { name, phone, password } = req.body

  if (phone) {
    const { validPhone, dialCode, cellularCode } = validator.validatePhone(phone)

    if (!validPhone || !(dialCode || cellularCode)) {
      invalidField(res, 'Invalid phone number!')
      return
    }

    const thisDoc = await CustomerService.findOne({ phone: validPhone })
    if (thisDoc && (thisDoc.phone !== doc.phone)) {
      alreadyCreated(res, 'phone', validPhone)
      return
    }

    updatedCustomerService.phone = validPhone
  }

  if (name) {
    const thisDoc = await CustomerService.findOne({ name })
    if (thisDoc && (thisDoc.name !== doc.name)) {
      alreadyCreated(res, 'name', name)
      return
    }

    updatedCustomerService.name = name
  }

  if (password) {
    const hash = crypto
      .createHmac('sha256', keys.hash)
      .update(password)
      .digest('hex')
    updatedCustomerService.password = hash
  }

  try {
    const { _id, name, phone, created, updated } = await updatedCustomerService.save()
    res.status(201).json({
      status: 200,
      success: {
        name: 'Success update existing CustomerService!',
        data: {
          _id,
          name,
          phone,
          created,
          updated
        }
      }
    })
  } catch (e) {
    next('Can\'t update CustomerService (id: ' + id + ')')
  }
})

// DELETE request
router.delete('/', requireId)
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params

  if (!isValid(id)) {
    invalidId(res, id)
    return
  }

  const doc = await CustomerService.findOne({ _id: id })
  if (!doc) {
    notFoundId(res, id)
    return
  }

  try {
    const { ok } = await CustomerService.deleteOne({ _id: id })

    if (!ok) {
      res.status(200).json({
        status: 200,
        success: {
          name: 'Can\'t delete CustomerService!',
          data: {
            id,
            status: 'havn\'t deleted yet'
          }
        }
      })
    } else {
      res.status(200).json({
        status: 200,
        success: {
          name: 'Success delete CustomerService!',
          data: {
            id,
            status: 'deleted'
          }
        }
      })
    }
  } catch (e) {
    next('Can\'t update CustomerService (id: ' + id + ')')
  }
})

// ALL request
router.all('/', notAllowedMethod)

// export module
module.exports = router
