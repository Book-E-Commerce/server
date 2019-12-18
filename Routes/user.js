const router = require('express').Router()
const UserController = require('../Controllers/user')

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.post('/gsignin', UserController.googleSignIn)

module.exports = router