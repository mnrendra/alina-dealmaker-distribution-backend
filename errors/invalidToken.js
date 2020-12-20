const invalidToken = (res, id) => {
  res.status(200).json({
    status: 200,
    error: {
      name: 'Invalid token!',
      message: `${id} is not valid token! Please input the correct token!`
    }
  })
}

module.exports = invalidToken
