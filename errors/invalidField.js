const invalidField = (res, message) => {
  res.status(400).json({
    status: 400,
    error: {
      name: 'Invalid field!',
      message: message
    }
  })
}

// export module
module.exports = invalidField
