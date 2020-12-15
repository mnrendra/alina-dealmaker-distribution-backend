const invalidField = (res, message) => {
  res.status(200).json({
    status: 200,
    error: {
      name: 'Invalid field!',
      message: message
    }
  })
}

// export module
module.exports = invalidField
