const crypto = require('crypto')
const router = require('express').Router()
const { isValid } = require('mongoose').Types.ObjectId

const { HASH_KEY } = require('../config')
const { validator } = require('../utils')
const { SuperAdmin, CustomerService } = require('../models')
const { notAllowedMethod, requireId, invalidField, alreadyCreated, invalidId, notFoundId, errorHandler } = require('../errors')

// GET request
router.get('/', async (req, res) => {
  const docs = await SuperAdmin.find()
  const rows = docs.map(({ _id, name, phone, created, updated }) => ({
    _id,
    id: _id,
    name,
    phone,
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

  const doc = await SuperAdmin.findOne({ _id: id })
  if (!doc) {
    notFoundId(res, id)
    return
  }

  const { _id, name, phone, created, updated } = doc
  res.status(200).json({
    _id,
    id: _id,
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

  const doc = await SuperAdmin.findOne({ phone: validPhone })
  if (doc) {
    alreadyCreated(res, 'Phone', validPhone)
    return
  }

  const docCSPhone = await CustomerService.findOne({ phone: validPhone })
  if (docCSPhone) {
    alreadyCreated(res, 'Phone', docCSPhone)
    return
  }

  const docName = await SuperAdmin.findOne({ name })
  if (docName) {
    alreadyCreated(res, 'Name', name)
    return
  }

  const hash = crypto
    .createHmac('sha256', HASH_KEY)
    .update(password)
    .digest('hex')

  const newSuperAdmin = new SuperAdmin({
    name,
    phone: validPhone,
    password: hash
  })

  try {
    const { _id, name, phone, created, updated } = await newSuperAdmin.save()
    res.status(200).json({
      status: 200,
      success: true,
      message: 'Success save new SuperAdmin!',
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
    next('Can\t save new SuperAdmin!', e)
  }
})

// PUT request
router.put('/', requireId)
router.put('/:id', async (req, res, next) => {
  const { name, phone, password } = req.body
  const { id } = req.params

  if (!isValid(id)) {
    invalidId(res, id)
    return
  }

  const doc = await SuperAdmin.findOne({ _id: id })
  if (!doc) {
    notFoundId(res, id)
    return
  }

  const updatedSuperAdmin = doc

  if (phone) {
    const { validPhone, dialCode, cellularCode } = validator.validatePhone(phone)

    if (!validPhone || !(dialCode || cellularCode)) {
      invalidField(res, 'Invalid phone number!')
      return
    }

    const thisDoc = await SuperAdmin.findOne({ phone: validPhone })
    if (thisDoc && (thisDoc.phone !== doc.phone)) {
      alreadyCreated(res, 'Phone', validPhone)
      return
    }

    const thisCSDoc = await CustomerService.findOne({ phone: validPhone })
    if (thisCSDoc && (thisCSDoc.phone !== doc.phone)) {
      alreadyCreated(res, 'Phone', validPhone)
      return
    }

    updatedSuperAdmin.phone = validPhone
  }

  if (name) {
    const thisDoc = await SuperAdmin.findOne({ name })
    if (thisDoc && (thisDoc.name !== doc.name)) {
      alreadyCreated(res, 'Name', name)
      return
    }

    updatedSuperAdmin.name = name
  }

  if (password) {
    const hash = crypto
      .createHmac('sha256', HASH_KEY)
      .update(password)
      .digest('hex')

    updatedSuperAdmin.password = hash
  }

  try {
    const { _id, name, phone, created, updated } = await updatedSuperAdmin.save()
    res.status(200).json({
      status: 200,
      success: true,
      message: 'Success update existing SuperAdmin!',
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
    next('Can\'t update SuperAdmin (id: ' + id + ')')
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

  const doc = await SuperAdmin.findOne({ _id: id })
  if (!doc) {
    notFoundId(res, id)
    return
  }

  try {
    const { ok } = await SuperAdmin.deleteOne({ _id: id })

    if (!ok) {
      errorHandler({
        name: 'Can\'t delete SuperAdmin (' + id + ')!',
        message: 'Response of SuperAdmin.deleteOne() is not "ok"!',
        stack: null
      }, req, res, next)
    } else {
      res.status(200).json({
        status: 200,
        success: true,
        name: 'Success delete SuperAdmin!',
        data: {
          _id: id,
          id,
          status: 'deleted'
        }
      })
    }
  } catch (e) {
    next('Can\'t delete SuperAdmin (id: ' + id + ')')
  }
})

// ALL request
router.all('/', notAllowedMethod)

// export module
module.exports = router
