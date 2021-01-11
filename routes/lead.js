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
    const getCS = async (activeCSs) => {
      try {
        const isEnd = i => i === (activeCSs.length - 1)

        let currentTurn = {}
        let nextTurn = {}

        for (let i = 0; i < activeCSs.length; i++) {
          if (activeCSs[i].isTurn) {
            currentTurn = activeCSs[i]
            nextTurn = isEnd(i)
              ? activeCSs[0]
              : activeCSs[i + 1]
            break
          } else if (isEnd(i)) {
            currentTurn = activeCSs[0]
            nextTurn = activeCSs[1]
          }
        }

        currentTurn.isTurn = false
        const updatedCurrentTurn = await currentTurn.save()

        nextTurn.isTurn = true
        await nextTurn.save()

        return updatedCurrentTurn
      } catch (e) {
        throw new Error(e)
      }
    }

    const getLeadIDNumber = (createdAt) => {
      const createdTime = new Date(createdAt)
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

      return leadID
    }

    const savingLead = async (lead, cs, changed = {}) => {
      try {
        const { name, phone, logs } = lead
        let newLogs = []
        let isNewLead = false
        const { from, to } = changed

        if (logs) {
          if (from && to) {
            logs.push({
              type: 'LEADING',
              noted: { type: 'CHANGE-CUSTOMER-SERVICE', from, to }
            })
            newLogs = logs
          } else {
            logs.push({
              type: 'LEADING',
              noted: {}
            })
            newLogs = logs
          }
        } else {
          newLogs = [{
            type: 'LEADING',
            noted: {}
          }]
          isNewLead = true
        }

        let leadData = {}

        if (isNewLead) {
          const newLead = new Lead({
            name: name,
            phone: phone,
            customerService: cs._id,
            logs: newLogs
          })

          const savedNewLead = await newLead.save()

          const leadIDNumber = getLeadIDNumber(savedNewLead.created)
          savedNewLead.idNumber = leadIDNumber

          const contactData = await googlePeople.createContact({
            firstName: leadIDNumber,
            lastName: cs.name,
            phone: savedNewLead.phone
          })

          savedNewLead.googleContact = contactData

          const updatedNewLead = await savedNewLead.save()

          leadData = updatedNewLead
        } else {
          lead.customerService = cs._id
          lead.logs = newLogs

          const updatedExistingLead = await lead.save()

          const contactData = await googlePeople.updateContact(
            updatedExistingLead.googleContact.resourceName,
            updatedExistingLead.googleContact.etag,
            { firstName: updatedExistingLead.idNumber, lastName: cs.name, phone: updatedExistingLead.phone }
          )

          updatedExistingLead.googleContact = contactData

          const finalUpdatedExistingLead = await updatedExistingLead.save()

          leadData = finalUpdatedExistingLead
        }

        const data = {
          _id: leadData._id,
          id: leadData._id,
          idNumber: leadData.idNumber,
          name: leadData.name,
          phone: leadData.phone,
          customerServiceId: leadData.customerService,
          created: leadData.created,
          updated: leadData.updated,
          customerService: cs
        }

        io.to('' + leadData.customerService).emit('new-leads', data)

        return data
      } catch (e) {
        throw new Error(e)
      }
    }

    try {
      const { name, phone } = req.body

      const { validPhone, dialCode, cellularCode } = validator.validatePhone(phone)

      if (!validPhone || !(dialCode || cellularCode)) {
        invalidField(res, 'Invalid phone number!')
        return
      }

      const existingLead = await Lead.findOne({ phone: validPhone })
      const allCSs = await CustomerService.find()
      const allActiveCSs = allCSs.filter(cs => cs.active && !cs.terminate)

      let data = {}

      if (existingLead) {
        const existingCS = allCSs.find(cs => String(cs._id) === String(existingLead.customerService)) || {}
        existingLead.name = name
        if (existingCS.active === true && existingCS.terminate === false) {
          data = await savingLead(
            existingLead,
            existingCS
          )
        } else {
          const turnedCS = await getCS(allActiveCSs)
          data = await savingLead(
            existingLead,
            turnedCS,
            { from: existingLead.customerService, to: turnedCS._id }
          )
        }
      } else {
        const turnedCS = await getCS(allActiveCSs)
        data = await savingLead(
          { name, phone: validPhone },
          turnedCS
        )
      }

      res.status(200).json({
        status: 200,
        success: true,
        message: 'Success save new Lead!',
        data: {
          ...data
        }
      })
    } catch (e) {
      console.log('E', e)
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
