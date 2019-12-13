const router = require('express').Router()
const cart = require('./cart')
const user = require('./user')
const book = require('./book')
const transactions = require('./transactions')


router.use('/carts', cart)
router.use('/users', user)
router.use('/books', book)
router.use('/transactions', transactions)

module.exports = router