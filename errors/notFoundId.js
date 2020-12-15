const notFoundId = (res, id) => {
  res.status(200).json({
    status: 200,
    error: {
      name: 'Not found Id!',
      message: `${id} id is not found! Please input the correct id!`
    }
  })
}

module.exports = notFoundId
