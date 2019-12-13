const Book = require('express').Router()
const { create, findOne, findAll, remove, update, seedingGoogle, popular } = require('../Controllers/book')

Book.post('/', create)
Book.get('/find-one', findOne)
Book.get('/find-all', findAll)
Book.delete('/:bookId', remove)
Book.patch('/:bookId', update)
// Book.get('/temp', fetchApi)
Book.post('/seedGoogle', seedingGoogle)
Book.get('/popular',popular)

module.exports = Book