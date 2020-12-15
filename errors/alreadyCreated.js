const alreadyCreated = (res, key, value) => {
  res.status(200).json({
    status: 200,
    error: {
      name: 'Have been created!',
      message: `${value} ${key} already created! Please create another one or delete this one!`
    }
  })
}

// export module
module.exports = alreadyCreated
