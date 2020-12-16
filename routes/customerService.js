const crypto = require('crypto')
const router = require('express').Router()
const { isValid } = require('mongoose').Types.ObjectId

const { HASH_KEY } = require('../config')
const { validator } = require('../utils')
const { CustomerService, SuperAdmin } = require('../models')
const { notAllowedMethod, requireId, invalidField, alreadyCreated, invalidId, notFoundId, errorHandler } = require('../errors')

// GET request
router.get('/', async (req, res) => {
  const docs = await CustomerService.find()
  const rows = docs.map(({ _id, name, phone, active, isTurn, created, updated }) => ({
    _id,
    id: _id,
    name,
    phone,
    active,
    isTurn,
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

  const { _id, name, phone, active, isTurn, created, updated } = doc
  res.status(200).json({
    _id,
    id: _id,
    name,
    phone,
    active,
    isTurn,
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
    alreadyCreated(res, 'Phone', validPhone)
    return
  }

  const docAdminPhone = await SuperAdmin.findOne({ phone: validPhone })
  if (docAdminPhone) {
    alreadyCreated(res, 'Phone', validPhone)
    return
  }

  const docName = await CustomerService.findOne({ name })
  if (docName) {
    alreadyCreated(res, 'Name', name)
    return
  }

  const hash = crypto
    .createHmac('sha256', HASH_KEY)
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
    res.status(200).json({
      status: 200,
      success: true,
      message: 'Success save new CustomerService!',
      data: {
        _id,
        id: _id,
        name,
        phone,
        active,
        isTurn,
        created,
        updated
      }
    })
  } catch (e) {
    next('Can\t save new CustomerService!', e)
  }
})

// PUT request
router.put('/', requireId)
router.put('/:id', async (req, res, next) => {
  const { name, phone, password, active, terminate } = req.body
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

  if (phone) {
    const { validPhone, dialCode, cellularCode } = validator.validatePhone(phone)

    if (!validPhone || !(dialCode || cellularCode)) {
      invalidField(res, 'Invalid phone number!')
      return
    }

    const thisDoc = await CustomerService.findOne({ phone: validPhone })
    if (thisDoc && (thisDoc.phone !== doc.phone)) {
      alreadyCreated(res, 'Phone', validPhone)
      return
    }

    const thisAdminDoc = await SuperAdmin.findOne({ phone: validPhone })
    if (thisAdminDoc && (thisAdminDoc.phone !== doc.phone)) {
      alreadyCreated(res, 'Phone', validPhone)
      return
    }

    updatedCustomerService.phone = validPhone
  }

  if (name) {
    const thisDoc = await CustomerService.findOne({ name })
    if (thisDoc && (thisDoc.name !== doc.name)) {
      alreadyCreated(res, 'Name', name)
      return
    }

    updatedCustomerService.name = name
  }

  if (password) {
    const hash = crypto
      .createHmac('sha256', HASH_KEY)
      .update(password)
      .digest('hex')

    updatedCustomerService.password = hash
  }

  if (active === false || active === true) {
    updatedCustomerService.active = active
  }

  if (terminate === false || terminate === true) {
    updatedCustomerService.terminate = terminate
  }

  try {
    const { _id, name, phone, created, updated } = await updatedCustomerService.save()
    res.status(200).json({
      status: 200,
      success: true,
      message: 'Success update existing CustomerService!',
      data: {
        _id,
        id: _id,
        name,
        phone,
        created,
        updated
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
      errorHandler({
        name: 'Can\'t delete CustomerService (' + id + ')!',
        message: 'Response of CustomerService.deleteOne() is not "ok"!',
        stack: null
      }, req, res, next)
    } else {
      res.status(200).json({
        status: 200,
        success: true,
        name: 'Success delete CustomerService!',
        data: {
          _id: id,
          id,
          status: 'deleted'
        }
      })
    }
  } catch (e) {
    next('Can\'t delete CustomerService (id: ' + id + ')')
  }
})

// ALL request
router.all('/', notAllowedMethod)

// export module
module.exports = router
