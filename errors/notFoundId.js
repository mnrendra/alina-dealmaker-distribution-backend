const notFoundId = (res, id) => {
  res.status(400).json({
    status: 400,
    error: {
      name: 'not found id!',
      message: `${id} id is not found! Please input the correct id!`
    }
  })
}

module.exports = notFoundId
