const transaction = require('express').Router()
const {user,all,create,remove, bestSelling, weeklyReport} = require('../Controllers/transactions')
const checkStorage = require('../Middlewares/checkStorage')

const {authentication, adminAuth, custAuth} = require('../Middlewares/auth')

transaction.get('/user',authentication, custAuth, user)
transaction.get('/all',authentication, adminAuth, all)
// transaction.get('/all', all)
transaction.get('/new', authentication, custAuth ,checkStorage, create)
transaction.delete('/:transactionId',authentication, adminAuth, remove)
transaction.get('/best-selling',authentication, adminAuth, bestSelling)
transaction.get('/weekly-report',authentication, adminAuth, weeklyReport)


module.exports = transaction