/**
 * invalidJsonHandler function
 */
const invalidJsonHandler = (err, req, res, next) => {
  err && res.status(400).json({
    status: 400,
    error: {
      name: 'invalid json!',
      message: 'please send valid json'
    }
  })
}

// export module
module.exports = invalidJsonHandler
