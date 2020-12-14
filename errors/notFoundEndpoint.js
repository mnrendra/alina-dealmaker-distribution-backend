const router = require('express').Router()

router.all('/', (req, res) => {
  res.status(404).json({
    status: 404,
    error: {
      name: '404 endpoint not found!',
      message: 'please use the correct endpoint!'
    }
  })
})

// export module
module.exports = router
