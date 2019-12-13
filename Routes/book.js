const Book = require('express').Router()
const { create, 
  findOne, 
  findByTitle, 
  findByAuthor,
  findAll, 
  remove, 
  update, 
  seedingGoogle, 
  popular,
  getAllCategories } = require('../Controllers/book')
const { multer,sendUploadToGCS } = require('../Middlewares/uploader')

Book.post('/',multer.single('image'),sendUploadToGCS, create)
Book.get('/find-one/:bookId', findOne)
Book.get('/book-title',findByTitle)
Book.get('/book-author',findByAuthor)
Book.get('/find-all', findAll)
Book.get('/get-categories', getAllCategories)
Book.delete('/:bookId', remove)
Book.patch('/:bookId', update)
Book.post('/seedGoogle', seedingGoogle)
Book.get('/popular',popular)

module.exports = Book