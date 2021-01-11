const router = require('express').Router()
const { isValid } = require('mongoose').Types.ObjectId

const { validator } = require('../utils')
const { Lead, CustomerService } = require('../models')
const { notAllowedMethod, requireId, invalidField, alreadyCreated, invalidId, notFoundId, invalidToken } = require('../errors')

const { people: googlePeople } = require('../googleapis')

const leadRoute = (io = {}) => {
  // GET request
  router.get('/', async (req, res, next) => {
    const { dealmaker, alltime, time } = req.query

    const filter = {}

    if (dealmaker) {
      if (!isValid(dealmaker)) {
        invalidId(res, dealmaker)
        return
      } else {
        filter.customerService = dealmaker
      }
    }

    let gteTime
    if (!alltime) {
      const now = new Date()
      gteTime = !isNaN(new Date(Number(time)).getTime()) ? Number(time) : new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`).getTime()
      const ltTime = gteTime + (1000 * 60 * 60 * 24 * 1)
      const gte = new Date(gteTime)
      const lt = new Date(ltTime)
      filter.created = { $gte: gte, $lt: lt }
    }

    try {
      const docs = await Lead.find(filter)
      const leads = docs.map(async ({ _id, name, phone, customerService, created, updated }) => {
        const cs = await CustomerService.findOne({ _id: customerService })
        return {
          _id,
          id: _id,
          name,
          phone,
          customerServiceId: cs._id,
          customerService: {
            _id: cs._id,
            id: cs._id,
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
      const sortByLatest = rows.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())

      res.status(200).json({
        date: filter.created ? new Date(gteTime) : 'All time',
        total: docs.length,
        rows: sortByLatest
      })
    } catch (e) {
      next('Can\'t get leads', e)
    }
  })

  router.get('/:id', async (req, res, next) => {
    const { id } = req.params

    if (!isValid(id)) {
      invalidId(res, id)
      return
    }

    try {
      const doc = await Lead.findOne({ _id: id })
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
    } catch (e) {
      next('Can\'t get lead ' + id, e)
    }
  })

  // POST request
  router.post('/', async (req, res, next) => {
    try {
      const { name, phone } = req.body

      const { validPhone, dialCode, cellularCode } = validator.validatePhone(phone)

      if (!validPhone || !(dialCode || cellularCode)) {
        invalidField(res, 'Invalid phone number!')
        return
      }

      const customerServices = await CustomerService.find()
      const activeCustomerServices = customerServices.filter(cs => cs.active && !cs.terminate)

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
        customerServiceId: currentTurn._id,
        customerService: currentTurn._id
      })

      const savedNewLead = await newLead.save()

      const createdTime = new Date(savedNewLead.created)
      const createdYY = String(createdTime.getFullYear()).slice(2, 4)
      const createdMonth = createdTime.getMonth() + 1
      const createdMM = createdMonth < 10 ? '0' + createdMonth : createdMonth
      const createdDate = createdTime.getDate()
      const createdDD = createdDate < 10 ? '0' + createdDate : createdDate

      const createdHours = createdTime.getHours()
      const createdhh = createdHours < 10 ? '0' + createdHours : createdHours
      const createdMinutes = createdTime.getMinutes()
      const createdmm = createdMinutes < 10 ? '0' + createdMinutes : createdMinutes
      const createdSeconds = createdTime.getSeconds()
      const createdss = createdSeconds < 10 ? '0' + createdSeconds : createdSeconds

      const leadID = `${createdYY}${createdMM}${createdDD}-${createdhh}${createdmm}${createdss}-1`

      currentTurn.isTurn = false
      const updatedCurrentTurn = await currentTurn.save()

      nextTurn.isTurn = true
      const updatedNextTurn = await nextTurn.save()

      const cs = customerServices.find(cs => cs._id === savedNewLead.customerService)

      const data = {
        _id: savedNewLead._id,
        id: savedNewLead._id,
        name: savedNewLead.name,
        phone: savedNewLead.phone,
        customerServiceId: savedNewLead.customerService,
        customerService: cs,
        created: savedNewLead.created,
        updated: savedNewLead.updated
      }

      const contactName = `${leadID} ${cs.name}`

      await googlePeople.createContact({ name: contactName, phone: validPhone })

      io.to('' + updatedCurrentTurn._id).emit('new-leads', data)

      res.status(200).json({
        status: 200,
        success: true,
        message: 'Success save new Lead!',
        data: {
          ...data,
          currentCustomerService: updatedCurrentTurn._id,
          nextCustomerService: updatedNextTurn._id
        }
      })
    } catch (e) {
      next('Can\t save new Lead!', e)
    }
  })

  router.post('/:token', async (req, res, next) => {
    try {
      const { token } = req.params

      if (token !== 'token-5fdba43af3ad02074da81c07') {
        invalidToken(res, token)
        return
      }

      const { name, phone, customerService, created, updated } = req.body

      const newLead = new Lead({
        name,
        phone,
        customerService,
        created,
        updated
      })

      const savedNewLead = await newLead.save()

      res.status(200).json({
        status: 200,
        success: true,
        message: 'Success save new Lead!',
        data: savedNewLead
      })
    } catch (e) {
      next('Can\t save new Lead by script!', e)
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
      res.status(200).json({
        status: 200,
        success: true,
        message: 'Success update existing Lead!',
        data: {
          _id,
          name,
          phone,
          created,
          updated
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
