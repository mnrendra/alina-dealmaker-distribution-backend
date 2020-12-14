const router = require('express').Router()
const { isValid } = require('mongoose').Types.ObjectId

const { Lead, CustomerService } = require('../models')
const { validator } = require('../utils')
const { notAllowedMethod, requireId, invalidField, alreadyCreated, invalidId, notFoundId } = require('../errors')

const leadRoute = (io = {}) => {
  // GET request
  router.get('/', async (req, res) => {
    const { dealmaker, year, month, date, alltime } = req.query

    const filter = {}

    if (isValid(dealmaker)) {
      filter.customerService = dealmaker
    }

    const now = new Date()
    const _year = Number(year) || now.getFullYear()
    const _month = Number(month) || now.getMonth()
    const _date = Number(date) || now.getDate()

    if (!alltime && _year && _month && _date) {
      const gte = new Date(`${_year}-${_month}-${_date}`)
      if (!isNaN(gte.getTime())) {
        const ltTime = gte.getTime() + (1000 * 60 * 60 * 24 * 1)
        const lt = new Date(ltTime)
        filter.created = { $gte: gte, $lt: lt }
      }
    }

    const docs = await Lead.find(filter)
    const leads = docs.map(async ({ _id, name, phone, customerService, created, updated }) => {
      const cs = await CustomerService.findOne({ _id: customerService })
      return {
        _id,
        name,
        phone,
        customerService: {
          _id: cs._id,
          name: cs.name,
          phone: cs.phone,
          active: cs.active,
          isTurn: cs.isTurn,
          created: cs.created,
          updated: cs.updated
        },
        created,
        updated
      }
    })

    const rows = await Promise.all(leads)

    res.status(200).json({
      date: filter.created ? _year + '-' + _month + '-' + _date : 'All time',
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

    const doc = await Lead.findOne({ _id: id })
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
    const { name, phone } = req.body

    const { validPhone, dialCode, cellularCode } = validator.validatePhone(phone)

    if (!validPhone || !(dialCode || cellularCode)) {
      invalidField(res, 'Invalid phone number!')
      return
    }

    const doc = await Lead.findOne({ phone: validPhone })
    if (doc) {
      alreadyCreated(res, 'phone', validPhone)
      return
    }

    const docName = await Lead.findOne({ name })
    if (docName) {
      alreadyCreated(res, 'name', validPhone)
      return
    }

    const customerServices = await CustomerService.find()
    const activeCustomerServices = customerServices.filter(cs => cs.active)

    const isEnd = i => i === (activeCustomerServices.length - 1)

    let currentTurn = {}
    let nextTurn = {}
    for (let i = 0; i < activeCustomerServices.length; i++) {
      if (activeCustomerServices[i].isTurn) {
        currentTurn = activeCustomerServices[i]
        nextTurn = isEnd(i)
          ? activeCustomerServices[0]
          : activeCustomerServices[i + 1]
        break
      } else if (isEnd(i)) {
        currentTurn = activeCustomerServices[0]
        nextTurn = activeCustomerServices[1]
      }
    }

    const newLead = new Lead({
      name,
      phone: validPhone,
      customerService: currentTurn._id
    })

    try {
      const { _id, name, phone, customerService, created, updated } = await newLead.save()

      currentTurn.isTurn = false
      currentTurn.leads.push(_id)
      const updatedCurrentTurn = await currentTurn.save()

      nextTurn.isTurn = true
      const updatedNextTurn = await nextTurn.save()

      const data = { _id, name, phone, customerService, created, updated }

      io.to('' + updatedCurrentTurn._id).emit('new-leads', data)

      res.status(201).json({
        status: 201,
        success: {
          name: 'Success save new Lead!',
          data: {
            ...data,
            currentCustomerService: updatedCurrentTurn._id,
            nextCustomerService: updatedNextTurn._id
          }
        }
      })
    } catch (e) {
      next('Can\t save new Lead!', e)
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

    const doc = await Lead.findOne({ _id: id })
    if (!doc) {
      notFoundId(res, id)
      return
    }

    const updatedLead = doc

    const { name, phone } = req.body

    if (phone) {
      const { validPhone, dialCode, cellularCode } = validator.validatePhone(phone)

      if (!validPhone || !(dialCode || cellularCode)) {
        invalidField(res, 'Invalid phone number!')
        return
      }

      const thisDoc = await Lead.findOne({ phone: validPhone })
      if (thisDoc && (thisDoc.phone !== doc.phone)) {
        alreadyCreated(res, 'phone', validPhone)
        return
      }

      updatedLead.phone = validPhone
    }

    if (name) {
      const thisDoc = await Lead.findOne({ name })
      if (thisDoc && (thisDoc.name !== doc.name)) {
        alreadyCreated(res, 'name', name)
        return
      }

      updatedLead.name = name
    }

    try {
      const { _id, name, phone, created, updated } = await updatedLead.save()
      res.status(201).json({
        status: 200,
        success: {
          name: 'Success update existing Lead!',
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
      next('Can\'t update Lead (id: ' + id + ')')
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

    const doc = await Lead.findOne({ _id: id })
    if (!doc) {
      notFoundId(res, id)
      return
    }

    try {
      const { ok } = await Lead.deleteOne({ _id: id })

      if (!ok) {
        res.status(200).json({
          status: 200,
          success: {
            name: 'Can\'t delete Lead!',
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
            name: 'Success delete Lead!',
            data: {
              id,
              status: 'deleted'
            }
          }
        })
      }
    } catch (e) {
      next('Can\'t update Lead (id: ' + id + ')')
    }
  })

  // ALL request
  router.all('/', notAllowedMethod)

  //
  return router
}

// export module
module.exports = leadRoute
