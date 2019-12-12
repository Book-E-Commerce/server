const routes = require('express').Router()
const books = require('./books')

routes.get('/',(req,res) => res.status(200).json({message: 'Connected on books server'}))
routes.use('/books',books)

module.exports = routes