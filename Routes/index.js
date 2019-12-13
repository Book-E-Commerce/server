const router = require('express').Router()
const cart = require('./cart')
const user = require('./user')
const book = require('./book')


router.use('/carts', cart)
router.use('/users', user)
router.use('/books', book)

module.exports = router