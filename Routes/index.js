const router = require('express').Router()
const cart = require('./cart')
const user = require('./user')

router.use('/carts', cart)
router.use('/users', user)

module.exports = router