const errorHandler = ({ name, message, stack }, req, res, next) => {
  // loging error into logs file
  console.log(`${new Date()} : ${stack}`)
  // send error message to client
  res.status(500).json({
    status: 500,
    error: {
      name,
      message
    }
  })
  // next
  next()
}

// export module
module.exports = errorHandler
