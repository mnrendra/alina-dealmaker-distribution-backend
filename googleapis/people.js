const { google } = require('googleapis')
const getAuth = require('./auth')

const VERSION = 'v1'

const googlePeople = async () => {
  try {
    const auth = await getAuth()
    return google.people({ version: VERSION, auth })
  } catch (e) {
    throw new Error(e)
  }
}

const createContact = async ({ firstName, lastName, phone }) => {
  try {
    if (!firstName) throw new Error('firstName is required!')
    if (!lastName) throw new Error('lastName is required!')
    if (!phone) throw new Error('phone is required!')

    const requestBody = {
      names: [{ givenName: firstName, familyName: lastName }],
      phoneNumbers: [{ value: phone }]
    }

    const service = await googlePeople()
    const res = await service.people.createContact({
      requestBody
    })

    return res.data
  } catch (e) {
    throw new Error(e)
  }
}

const updateContact = async (resourceName, etag, { firstName, lastName, phone }) => {
  try {
    if (!resourceName) throw new Error('resourceName is required!')
    if (!etag) throw new Error('etag is required!')
    if (!firstName) throw new Error('firstName is required!')
    if (!lastName) throw new Error('lastName is required!')
    if (!phone) throw new Error('phone is required!')

    const requestBody = {
      etag,
      names: [{ givenName: firstName, familyName: lastName }],
      phoneNumbers: [{ value: phone }]
    }

    const service = await googlePeople()
    const res = await service.people.updateContact({
      resourceName,
      updatePersonFields: ['names', 'phoneNumbers'],
      requestBody
    })

    return res.data
  } catch (e) {
    throw new Error(e)
  }
}

const people = {
  createContact,
  updateContact
}

module.exports = people
