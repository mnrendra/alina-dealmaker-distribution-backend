const { mongodb } = require('./db')
const app = require('./app')

// set port
const PORT = process.env.PORT || 3001

mongodb()
  .then(res => {
    if (!res) throw new Error('MongoDB Error')

    app.listen(PORT, function () {
      console.log(`the 'app' running on port: ${this.address().port}`)
    })
  })
  .catch(e => {
    throw new Error(e)
  })
