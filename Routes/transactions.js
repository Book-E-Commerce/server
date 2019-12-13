const transaction = require('express').Router()
const {user,all,create,remove} = require('../Controllers/transactions')
const checkStorage = require('../Middlewares/checkStorage')

const {authentication, adminAuth, custAuth} = require('../Middlewares/auth')

transaction.get('/user',authentication, custAuth, user)
transaction.get('/all',authentication, adminAuth, all)
transaction.get('/new', authentication, custAuth ,checkStorage, create)
transaction.delete('/:transactionId',authentication, adminAuth, remove)


module.exports = transaction