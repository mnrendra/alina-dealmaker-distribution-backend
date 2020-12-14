const listOfCountries = require('./countries.json')
const listIDCellularCodes = require('./listIDCellularCodes')

const validatePhone = (phone) => {
  if (typeof phone !== 'string' || phone.length < 3 || phone.length > 16) return false

  let dialCode
  let cellularCode
  let validPhoneByCountryCode
  let validPhoneByCellularCode

  listOfCountries.some(country => {
    if (phone.includes(country.dial_code)) {
      const phoneSplit = phone.split(country.dial_code)
      if (phoneSplit[0] === '' && Number(phoneSplit[1])) {
        dialCode = country.dial_code
        validPhoneByCountryCode = country.dial_code + Number(phoneSplit[1])
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  })

  listIDCellularCodes.some(code => {
    if (phone.includes(code)) {
      const phoneSplit = phone.split(code)
      if (phoneSplit[0] === '' && Number(phoneSplit[1])) {
        cellularCode = code
        validPhoneByCellularCode = phone.replace(0, '+62')
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  })

  if (dialCode) {
    return {
      validPhone: validPhoneByCountryCode,
      dialCode: dialCode
    }
  } else if (cellularCode) {
    return {
      validPhone: validPhoneByCellularCode,
      cellularCode: cellularCode
    }
  } else {
    return {}
  }
}

module.exports = {
  validatePhone
}
