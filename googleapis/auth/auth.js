const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { google } = require('googleapis')

const CREDENTIALS = require('./credentials')

const STORED_TOKEN_PATH = './json/stored_token.json'

const SCOPES = [
  'https://www.googleapis.com/auth/contacts'
]

const storeNewToken = (storedTokenPath, tokens) => {
  try {
    fs.writeFileSync(storedTokenPath, JSON.stringify(tokens))
  } catch (e) {
    console.log(e)
  }
}

const getNewToken = (oAuth2Client, scopes) => {
  return new Promise((resolve, reject) => {
    try {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
      })

      console.log('Authorize this app by visiting this url:', authUrl)

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      rl.question('Enter the code from that page here: ', (code) => {
        try {
          rl.close()

          const token = oAuth2Client.getToken(code)
          resolve(token)
        } catch (e) {
          reject(e)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

const validateCredentials = ({ clientId, clientSecret, redirectURIs, scopes, storedTokenPath }) => {
  try {
    const validCredential = {}

    if (clientId && clientSecret && redirectURIs && scopes && storedTokenPath) {
      validCredential.clientId = clientId
      validCredential.clientSecret = clientSecret
      validCredential.redirectURIs = redirectURIs
      validCredential.scopes = scopes
      validCredential.storedTokenPath = storedTokenPath
      return validCredential
    } else {
      if (CREDENTIALS.installed) {
        validCredential.clientId = CREDENTIALS.installed.client_id
        validCredential.clientSecret = CREDENTIALS.installed.client_secret
        validCredential.redirectURIs = CREDENTIALS.installed.redirect_uris
      } else {
        validCredential.clientId = CREDENTIALS.client_id
        validCredential.clientSecret = CREDENTIALS.client_secret
        validCredential.redirectURIs = CREDENTIALS.redirect_uris
      }

      validCredential.scopes = SCOPES
      validCredential.storedTokenPath = path.join(__dirname, STORED_TOKEN_PATH)

      return validCredential
    }
  } catch (e) {
    throw new Error(e)
  }
}

const getAuth = async (credentials = {}) => {
  try {
    const { clientId, clientSecret, redirectURIs, scopes, storedTokenPath } = validateCredentials(credentials)

    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectURIs[0])

    let storedToken = ''

    try {
      const data = fs.readFileSync(storedTokenPath)
      storedToken = JSON.parse(data)
    } catch (e) {
      try {
        storedToken = await getNewToken(oAuth2Client, scopes)
        storeNewToken(storedTokenPath, storedToken)
      } catch (e) {
        throw new Error(e)
      }
    }

    oAuth2Client.on('tokens', (tokens) => {
      const refreshToken = tokens.refresh_token || storedToken.refresh_token
      storeNewToken(storedTokenPath, { ...tokens, refresh_token: refreshToken })
    })

    oAuth2Client.setCredentials(storedToken)

    return oAuth2Client
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = getAuth
