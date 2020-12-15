const router = require('express').Router()

router.all('/', (req, res) => {
  res.status(200).json({
    status: 200,
    error: {
      name: '404 endpoint not found!',
      message: 'please use the correct endpoint!'
    }
  })
})

// export module
module.exports = router
