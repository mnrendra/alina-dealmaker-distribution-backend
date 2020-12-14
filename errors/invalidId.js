const invalidId = (res, id) => {
  res.status(400).json({
    status: 400,
    error: {
      name: 'invalid id!',
      message: `${id} is not valid id! Please input the correct id!`
    }
  })
}

module.exports = invalidId
