const requireId = (req, res) => {
  res.status(200).json({
    status: 200,
    error: {
      name: 'Id params is required!',
      message: 'Require id parameter!'
    }
  })
}

module.exports = requireId
