const alreadyCreated = (res, key, value) => {
  res.status(400).json({
    status: 400,
    error: {
      name: 'have been created!',
      message: `${value} ${key} already created! please create another one or delete this one!`
    }
  })
}

// export module
module.exports = alreadyCreated
