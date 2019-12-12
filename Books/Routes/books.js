const Book = require('express').Router()
const { create, findOne, findAll, remove, update, fetchApi } = require('../Controllers/BookController')

Book.post('/', create)
Book.get('/find-one', findOne)
Book.get('/find-all', findAll)
Book.delete('/:bookId', remove)
Book.patch('/:bookId', update)
Book.get('/temp', fetchApi)

module.exports = Book