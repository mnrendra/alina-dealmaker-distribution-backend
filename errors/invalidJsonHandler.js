const invalidJsonHandler = (err, req, res, next) => {
  err && res.status(200).json({
    status: 200,
    error: {
      name: 'Invalid JSON!',
      message: 'Please send valid JSON!'
    }
  })
}

// export module
module.exports = invalidJsonHandler
