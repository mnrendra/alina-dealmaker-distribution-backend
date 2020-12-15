const notAllowedMethod = ({ method }, res) => {
  res.status(200).json({
    status: 200,
    error: {
      name: 'Not allowed method',
      message: `${method} method is not allowed!`
    }
  })
}

module.exports = notAllowedMethod
