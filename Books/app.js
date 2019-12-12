if (process.env.NODE_ENV === 'development') require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
const routes = require('./Routes')
const errorHandler = require('./Middlewares/errorHandler.js')
const app = express()
const PORT = process.env.PORT_BOOKS || 3000

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(cors())
app.use(morgan('dev'))

// mongoose.connect(process.env.MONGO_LOCAL, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

app.use(routes)

app.use(errorHandler)

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`))
