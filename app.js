if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const connection = process.env.CONNECTION
const PORT = process.env.PORT
const cors = require('cors')
const routes = require('./Routes/index')
const err = require('./Middlewares/errHandler')
const morgan = require('morgan')

/*istanbul ignore next */
if (process.env.NODE_ENV === 'development'){
  /*istanbul ignore next */
  mongoose.connect(connection, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error'))
  db.once('open', function () {
    console.log('Database Development connected!');
  })
} else {
  mongoose.connect('mongodb://localhost:27017/final_project_server_test', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error'))
  db.once('open', function () {
    console.log('Database Testing connected!');
  })
}

app.use(morgan('dev'))
app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use('/', routes)
app.use(err)

app.listen(PORT, () => {
  console.log(`Listening on port PORT ${PORT}`);
})

module.exports = app