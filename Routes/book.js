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
  getAllCategories,
  findByCategory,
  elastic } = require('../Controllers/book')
const { multer,sendUploadToGCS } = require('../Middlewares/uploader')
const { adminAuth, authentication,  } = require('../Middlewares/auth')

Book.post('/',authentication, adminAuth, multer.single('image'),sendUploadToGCS, create)
Book.get('/find-one/:bookId', findOne)
Book.get('/book-title',findByTitle)
Book.get('/book-author',findByAuthor)
Book.get('/book-category', findByCategory)
Book.get('/find-all', findAll)
Book.get('/get-categories', getAllCategories)
Book.delete('/:bookId',authentication, adminAuth, remove)
Book.patch('/:bookId',authentication, adminAuth, multer.single('image'),sendUploadToGCS,update)
Book.post('/seedGoogle', seedingGoogle)
Book.get('/popular',popular)
Book.get('/search', elastic)

module.exports = Book