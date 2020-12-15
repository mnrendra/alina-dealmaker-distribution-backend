const { mongodb } = require('./db')
const app = require('./app')
const config = require('./config')

const PORT /* -------- */ = process.env.PORT /* -------- */ || config.PORT /* -------- */ || 3001
const MONGODB_URL /* - */ = process.env.MONGODB_URL /* - */ || config.MONGODB_URL /* - */ || 'mongodb://localhost:27017/alina'
const MONGODB_OPT /* - */ = process.env.MONGODB_OPT /* - */ || config.MONGODB_OPT /* - */ || {}

mongodb(MONGODB_URL, MONGODB_OPT)
  .then(res => {
    if (!res) throw new Error('MongoDB Error')

    app.listen(PORT, function () {
      console.log(`the 'app' running on port: ${this.address().port}`)
    })
  })
  .catch(e => {
    throw new Error(e)
  })
