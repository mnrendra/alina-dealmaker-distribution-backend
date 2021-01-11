const credentials = require('./json/credentials.json')
const { GOOGLE_APIS } = require('../../config')

const { installed = {} } = credentials

module.exports = {
  client_id: GOOGLE_APIS.CLIENT_ID || installed.client_id || credentials.client_id,
  client_secret: GOOGLE_APIS.CLIENT_SECRET || installed.client_secret || credentials.client_secret,
  redirect_uris: GOOGLE_APIS.REDIRECT_URIS || installed.redirect_uris || credentials.redirect_uris,
  scopes: GOOGLE_APIS.SCOPES || installed.scopes || credentials.scopes
}
