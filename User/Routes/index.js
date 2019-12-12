const router = require('express').Router()
const User = require('./user')

router.use('/users', User)

module.exports = router