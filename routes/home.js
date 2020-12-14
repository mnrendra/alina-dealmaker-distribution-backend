const router = require('express').Router()

// POST request
router.get('/', (req, res) => {
  res.status(200).send({
    ok: true
  })
})

// export module
module.exports = router
