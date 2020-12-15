const invalidId = (res, id) => {
  res.status(200).json({
    status: 200,
    error: {
      name: 'Invalid Id!',
      message: `${id} is not valid id! Please input the correct id!`
    }
  })
}

module.exports = invalidId
