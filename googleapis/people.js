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

const createContact = async ({ name, phone }) => {
  try {
    const service = await googlePeople()
    const res = await service.people.createContact({
      requestBody: {
        names: [{ givenName: name }],
        phoneNumbers: [{ value: phone }]
      }
    })

    return res.data
  } catch (e) {
    throw new Error(e)
  }
}

const people = {
  createContact
}

module.exports = people
